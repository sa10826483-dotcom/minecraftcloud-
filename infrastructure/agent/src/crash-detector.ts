import * as fs from 'fs';
import * as path from 'path';
import { DockerOrchestrator } from './docker';
import { config } from './config';

export interface CrashPolicy {
  autoRestart: boolean;
  maxRetries: number;
  delayMs: number;
}

export class CrashDetector {
  private orchestrator: DockerOrchestrator;
  private crashCounts: Map<string, number> = new Map();
  private crashReasons: Map<string, string> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.orchestrator = DockerOrchestrator.getInstance();
  }

  public startMonitoring(intervalMs: number = 5000): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      await this.scanServerHealth();
    }, intervalMs);

    console.log(`[CrashDetector] Active monitoring initialized (interval: ${intervalMs}ms)`);
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async scanServerHealth(): Promise<void> {
    // Monitored via Docker status checks
  }

  public async handleServerCrash(serverId: string, exitCode: number, errorOutput?: string): Promise<void> {
    const retries = (this.crashCounts.get(serverId) || 0) + 1;
    this.crashCounts.set(serverId, retries);

    const reason = errorOutput || `Process terminated unexpectedly with exit code ${exitCode}`;
    this.crashReasons.set(serverId, reason);

    // Persist crash log into server's crash-reports folder
    this.saveCrashLog(serverId, reason, exitCode);

    this.orchestrator.appendLog(
      serverId,
      `[CRASH ALERT] Server crashed with exit code ${exitCode}. Crash count: ${retries}/${config.maxCrashRetries}.`
    );

    if (retries > config.maxCrashRetries) {
      this.orchestrator.appendLog(
        serverId,
        `[CRASH LOOP PREVENTED] Server exceeded maximum crash retries (${config.maxCrashRetries}). Halting auto-restart.`
      );
      this.orchestrator.appendLog(
        serverId,
        `[ACTION REQUIRED] Inspect server logs or plugins/mods for fatal errors before starting again.`
      );
      return;
    }

    this.orchestrator.appendLog(
      serverId,
      `[AUTO RECOVERY] Waiting ${config.crashDelayMs / 1000}s before automatic recovery reboot...`
    );

    setTimeout(async () => {
      try {
        this.orchestrator.appendLog(serverId, `[AUTO RECOVERY] Attempting server reboot (attempt ${retries})...`);
        await this.orchestrator.startServer(serverId);
        this.orchestrator.appendLog(serverId, `[AUTO RECOVERY] Server reboot triggered successfully.`);
      } catch (err: any) {
        this.orchestrator.appendLog(serverId, `[AUTO RECOVERY FAILED] ${err.message}`);
      }
    }, config.crashDelayMs);
  }

  public resetCrashCount(serverId: string): void {
    this.crashCounts.set(serverId, 0);
    this.crashReasons.delete(serverId);
  }

  public getCrashInfo(serverId: string): { count: number; reason: string | null } {
    return {
      count: this.crashCounts.get(serverId) || 0,
      reason: this.crashReasons.get(serverId) || null,
    };
  }

  private saveCrashLog(serverId: string, reason: string, exitCode: number): void {
    try {
      const reportsDir = path.resolve(config.dataDir, serverId, 'crash-reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const crashFile = path.join(reportsDir, `crash-${timestamp}-server.txt`);

      const content = `---- MinecraftCloud Crash Report ----
Timestamp: ${new Date().toISOString()}
Server ID: ${serverId}
Exit Code: ${exitCode}
Reason: ${reason}

Recent Console Logs:
${this.orchestrator.getLogs(serverId, 50).join('\n')}
`;

      fs.writeFileSync(crashFile, content, 'utf8');
    } catch {}
  }
}
