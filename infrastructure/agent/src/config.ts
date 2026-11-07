import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.AGENT_PORT || '8443', 10),
  secret: process.env.AGENT_SECRET || 'minecraftcloud-super-secret-node-key-2026',
  dataDir: process.env.DATA_DIR || path.resolve(process.cwd(), 'data', 'servers'),
  backupsDir: process.env.BACKUPS_DIR || path.resolve(process.cwd(), 'data', 'backups'),
  dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
  publicHost: process.env.PUBLIC_HOST || 'play.minecraftcloud.net',
  defaultJavaPort: 25565,
  defaultBedrockPort: 19132,
  defaultRconPort: 25575,
  maxCrashRetries: 3,
  crashDelayMs: 10000,
  isWindows: process.platform === 'win32',
};
