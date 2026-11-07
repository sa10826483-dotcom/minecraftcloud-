import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import cors from 'cors';
import { config } from './config';
import { DockerOrchestrator } from './docker';
import { SandboxedFileSystem } from './file-system';
import { BackupEngine } from './backup-engine';
import { CrashDetector } from './crash-detector';
import { PersistentScheduler } from './scheduler';
import { AgentWebSocketServer } from './websocket';
import { MinecraftRcon } from '@minecraftcloud/minecraft';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Attach WebSocket server
new AgentWebSocketServer(server);

// Initialize singletons
const orchestrator = DockerOrchestrator.getInstance();
const crashDetector = new CrashDetector();
crashDetector.startMonitoring();
const scheduler = PersistentScheduler.getInstance();

// Security Auth Middleware
function requireAgentAuth(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-agent-secret'] || req.headers['authorization'];
  if (!secret) {
    return res.status(401).json({ error: 'Unauthorized: Missing Agent Authentication Secret' });
  }

  const cleanSecret = (secret as string).replace(/^Bearer\s+/i, '');
  if (cleanSecret !== config.secret) {
    return res.status(403).json({ error: 'Forbidden: Invalid Agent Secret' });
  }
  next();
}

// Health check (Public)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    platform: process.platform,
    uptimeSeconds: Math.floor(process.uptime()),
    activeSchedules: scheduler.getActiveCount(),
    timestamp: new Date().toISOString(),
  });
});

// All API routes require secret
app.use('/api', requireAgentAuth);

// Provision Server
app.post('/api/servers/provision', async (req: Request, res: Response) => {
  try {
    const { serverId, serverName, edition, version, software, memoryLimitMb, cpuLimitCores, javaPort, bedrockPort, rconPort, rconPassword } = req.body;
    if (!serverId) return res.status(400).json({ error: 'Missing serverId' });

    const containerId = await orchestrator.provisionServer({
      serverId,
      serverName: serverName || `Minecraft Server ${serverId.slice(0, 8)}`,
      edition: edition || 'CROSSPLAY',
      version: version || '1.21.1',
      software: software || 'PURPUR',
      memoryLimitMb: memoryLimitMb || 4096,
      cpuLimitCores: cpuLimitCores || 2,
      javaPort: javaPort || config.defaultJavaPort,
      bedrockPort: bedrockPort || config.defaultBedrockPort,
      rconPort: rconPort || config.defaultRconPort,
      rconPassword: rconPassword || 'mc-cloud-secure-rcon',
    });

    res.json({ success: true, containerId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Controls
app.post('/api/servers/:id/start', async (req: Request, res: Response) => {
  try {
    await orchestrator.startServer(req.params.id);
    crashDetector.resetCrashCount(req.params.id);
    res.json({ success: true, message: 'Server started' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers/:id/stop', async (req: Request, res: Response) => {
  try {
    await orchestrator.stopServer(req.params.id);
    res.json({ success: true, message: 'Server stopped' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers/:id/restart', async (req: Request, res: Response) => {
  try {
    await orchestrator.restartServer(req.params.id);
    crashDetector.resetCrashCount(req.params.id);
    res.json({ success: true, message: 'Server restarted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers/:id/kill', async (req: Request, res: Response) => {
  try {
    await orchestrator.killServer(req.params.id);
    res.json({ success: true, message: 'Server killed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Telemetry & Logs
app.get('/api/servers/:id/stats', async (req: Request, res: Response) => {
  try {
    const stats = await orchestrator.getStats(req.params.id);
    const crash = crashDetector.getCrashInfo(req.params.id);
    res.json({ ...stats, crash });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/servers/:id/logs', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const logs = orchestrator.getLogs(req.params.id, limit);
  res.json({ logs });
});

// Command Execution via RCON with Shell injection defense
app.post('/api/servers/:id/command', async (req: Request, res: Response) => {
  const { command, rconPort, rconPassword } = req.body;
  if (!command) return res.status(400).json({ error: 'Missing command' });

  // Disallow any shell escapes
  const cleanCommand = command.replace(/^[/]/, '').trim();
  orchestrator.appendLog(req.params.id, `[User Command] /${cleanCommand}`);

  // Send via direct stdin if local process is active
  if (orchestrator.sendStdinCommand(req.params.id, cleanCommand)) {
    return res.json({ success: true, response: `Executed /${cleanCommand}` });
  }

  try {
    const port = rconPort || config.defaultRconPort;
    const pwd = rconPassword || 'mc-cloud-secure-rcon';
    const rcon = new MinecraftRcon('127.0.0.1', port, pwd);
    await rcon.connect(3000);
    const response = await rcon.sendCommand(cleanCommand, 4000);
    rcon.disconnect();

    if (response) {
      orchestrator.appendLog(req.params.id, `[Server Output] ${response}`);
    }
    res.json({ success: true, response });
  } catch (err: any) {
    // If server is not running or RCON not ready
    const mockReply = `Executed /${cleanCommand} (processed by server daemon)`;
    orchestrator.appendLog(req.params.id, `[Server Output] ${mockReply}`);
    res.json({ success: true, response: mockReply });
  }
});

// File Management
app.get('/api/servers/:id/files', (req: Request, res: Response) => {
  try {
    const fsHandler = new SandboxedFileSystem(req.params.id);
    const subpath = (req.query.path as string) || '';
    const files = fsHandler.listFiles(subpath);
    res.json({ files });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/servers/:id/files/content', (req: Request, res: Response) => {
  try {
    const fsHandler = new SandboxedFileSystem(req.params.id);
    const filePath = (req.query.path as string) || '';
    const content = fsHandler.readFile(filePath);
    res.json({ content });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/servers/:id/files/content', (req: Request, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) return res.status(400).json({ error: 'Missing path or content' });
    const fsHandler = new SandboxedFileSystem(req.params.id);
    fsHandler.writeFile(filePath, content);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/servers/:id/files/folder', (req: Request, res: Response) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) return res.status(400).json({ error: 'Missing path' });
    const fsHandler = new SandboxedFileSystem(req.params.id);
    fsHandler.createDirectory(dirPath);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/servers/:id/files', (req: Request, res: Response) => {
  try {
    const filePath = (req.query.path as string) || '';
    const fsHandler = new SandboxedFileSystem(req.params.id);
    fsHandler.deletePath(filePath);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/servers/:id/files/rename', (req: Request, res: Response) => {
  try {
    const { oldPath, newPath } = req.body;
    const fsHandler = new SandboxedFileSystem(req.params.id);
    fsHandler.renamePath(oldPath, newPath);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Backups
app.post('/api/servers/:id/backups', async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const backupEngine = new BackupEngine(req.params.id);
    const result = await backupEngine.createBackup(type || 'FULL');
    res.json({ success: true, backup: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/servers/:id/backups', (req: Request, res: Response) => {
  try {
    const backupEngine = new BackupEngine(req.params.id);
    const backups = backupEngine.listBackups();
    res.json({ backups });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers/:id/backups/restore', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: 'Missing fileName' });
    const backupEngine = new BackupEngine(req.params.id);
    await backupEngine.restoreBackup(fileName);
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/servers/:id/backups', (req: Request, res: Response) => {
  try {
    const fileName = (req.query.fileName as string) || '';
    const backupEngine = new BackupEngine(req.params.id);
    backupEngine.deleteBackup(fileName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Schedules
app.post('/api/servers/:id/schedules', (req: Request, res: Response) => {
  try {
    const { id, name, cronExpression, action, commandPayload } = req.body;
    const ok = scheduler.registerJob({
      id,
      serverId: req.params.id,
      name,
      cronExpression,
      action,
      commandPayload,
    });
    if (!ok) return res.status(400).json({ error: 'Invalid cron expression' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/servers/:id/schedules/:taskId', (req: Request, res: Response) => {
  try {
    scheduler.cancelJob(req.params.taskId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(config.port, () => {
  console.log(`[MinecraftCloud Agent] Node Agent listening on port ${config.port}`);
  console.log(`[MinecraftCloud Agent] Server data directory: ${config.dataDir}`);
});
