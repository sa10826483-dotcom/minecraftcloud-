import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import * as tar from 'tar';
import { config } from './config';
import { SandboxedFileSystem } from './file-system';

export type BackupType = 'FULL' | 'WORLD_ONLY' | 'CONFIG_ONLY';

export interface BackupResult {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  checksum: string;
}

export class BackupEngine {
  private serverId: string;
  private serverDir: string;
  private backupDir: string;

  constructor(serverId: string) {
    this.serverId = serverId;
    this.serverDir = path.resolve(config.dataDir, serverId);
    this.backupDir = path.resolve(config.backupsDir, serverId);

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public async createBackup(type: BackupType = 'FULL'): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${type.toLowerCase()}-${timestamp}.tar.gz`;
    const destinationPath = path.join(this.backupDir, fileName);

    const output = fs.createWriteStream(destinationPath);
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 6 },
    });

    const hash = crypto.createHash('sha256');

    return new Promise<BackupResult>((resolve, reject) => {
      output.on('close', () => {
        const stats = fs.statSync(destinationPath);
        const checksum = 'sha256:' + hash.digest('hex');
        resolve({
          fileName,
          filePath: destinationPath,
          sizeBytes: stats.size,
          checksum,
        });
      });

      archive.on('data', (chunk) => {
        hash.update(chunk);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      if (type === 'FULL') {
        archive.directory(this.serverDir, false);
      } else if (type === 'WORLD_ONLY') {
        const worlds = ['world', 'world_nether', 'world_the_end'];
        for (const w of worlds) {
          const wPath = path.join(this.serverDir, w);
          if (fs.existsSync(wPath)) {
            archive.directory(wPath, w);
          }
        }
      } else if (type === 'CONFIG_ONLY') {
        const configExtensions = ['.properties', '.json', '.yml', '.yaml', '.txt', '.conf'];
        const files = fs.readdirSync(this.serverDir, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile() && configExtensions.some((ext) => file.name.endsWith(ext))) {
            archive.file(path.join(this.serverDir, file.name), { name: file.name });
          }
        }
        const pluginsConfig = path.join(this.serverDir, 'plugins');
        if (fs.existsSync(pluginsConfig)) {
          archive.glob('**/*.yml', { cwd: pluginsConfig });
          archive.glob('**/*.json', { cwd: pluginsConfig });
        }
      }

      archive.finalize();
    });
  }

  public async restoreBackup(fileName: string): Promise<void> {
    const backupFilePath = path.join(this.backupDir, fileName);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup archive does not exist: ${fileName}`);
    }

    // Extract archive safely into server directory
    await tar.x({
      file: backupFilePath,
      cwd: this.serverDir,
      preservePaths: false,
    });
  }

  public listBackups(): Array<{ name: string; sizeBytes: number; createdAt: string }> {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir);
    return files
      .filter((f) => f.endsWith('.tar.gz'))
      .map((f) => {
        const p = path.join(this.backupDir, f);
        const st = fs.statSync(p);
        return {
          name: f,
          sizeBytes: st.size,
          createdAt: st.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public deleteBackup(fileName: string): void {
    const backupFilePath = path.join(this.backupDir, fileName);
    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }
  }
}
