import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  updatedAt: string;
  isImportant?: boolean;
}

export class SandboxedFileSystem {
  private serverId: string;
  private serverRoot: string;

  private static readonly IMPORTANT_FILES = new Set([
    'server.properties',
    'eula.txt',
    'ops.json',
    'whitelist.json',
    'banned-players.json',
    'banned-ips.json',
    'paper-global.yml',
    'purpur.yml',
    'spigot.yml',
    'bukkit.yml',
    'config.yml',
  ]);

  constructor(serverId: string) {
    this.serverId = serverId;
    this.serverRoot = path.resolve(config.dataDir, serverId);
    if (!fs.existsSync(this.serverRoot)) {
      fs.mkdirSync(this.serverRoot, { recursive: true });
    }
  }

  public getServerRoot(): string {
    return this.serverRoot;
  }

  /**
   * Resolves and verifies that a relative path stays within the server root.
   * Throws Error if traversal is detected.
   */
  public resolveSafePath(relativePath: string = ''): string {
    // Clean null bytes and invalid characters
    const cleanPath = relativePath.replace(/\0/g, '').trim();

    // Prevent direct root references
    const resolved = path.resolve(this.serverRoot, cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath);

    // Strict boundary assertion
    if (!resolved.startsWith(this.serverRoot)) {
      throw new Error(`Access Denied: Path traversal detected outside server boundaries: ${relativePath}`);
    }

    // Verify real path if file exists to prevent symlink bypass
    if (fs.existsSync(resolved)) {
      const real = fs.realpathSync(resolved);
      const realRoot = fs.realpathSync(this.serverRoot);
      if (!real.startsWith(realRoot)) {
        throw new Error('Access Denied: Symlink target is outside server sandbox');
      }
    }

    return resolved;
  }

  public listFiles(subPath: string = ''): FileItem[] {
    const targetDir = this.resolveSafePath(subPath);

    if (!fs.existsSync(targetDir)) {
      return [];
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    return entries.map((entry) => {
      const fullPath = path.join(targetDir, entry.name);
      let sizeBytes = 0;
      let updatedAt = new Date().toISOString();

      try {
        const stats = fs.statSync(fullPath);
        sizeBytes = stats.isDirectory() ? 0 : stats.size;
        updatedAt = stats.mtime.toISOString();
      } catch {
        // Ignored for broken files/locks
      }

      const relPath = path.relative(this.serverRoot, fullPath).replace(/\\/g, '/');

      return {
        name: entry.name,
        path: relPath,
        isDirectory: entry.isDirectory(),
        sizeBytes,
        updatedAt,
        isImportant: SandboxedFileSystem.IMPORTANT_FILES.has(entry.name),
      };
    }).sort((a, b) => {
      // Directories first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  public readFile(filePath: string): string {
    const safePath = this.resolveSafePath(filePath);
    if (!fs.existsSync(safePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(safePath);
    if (stats.isDirectory()) {
      throw new Error(`Cannot read directory as text file: ${filePath}`);
    }

    // Protect from reading massive files into memory (e.g., max 5MB text)
    if (stats.size > 5 * 1024 * 1024) {
      throw new Error(`File is too large to open in text editor (${(stats.size / 1024 / 1024).toFixed(1)}MB). Limit: 5MB.`);
    }

    return fs.readFileSync(safePath, 'utf8');
  }

  public writeFile(filePath: string, content: string): void {
    const safePath = this.resolveSafePath(filePath);
    const parentDir = path.dirname(safePath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(safePath, content, 'utf8');
  }

  public createDirectory(dirPath: string): void {
    const safePath = this.resolveSafePath(dirPath);
    if (!fs.existsSync(safePath)) {
      fs.mkdirSync(safePath, { recursive: true });
    }
  }

  public deletePath(targetPath: string): void {
    const safePath = this.resolveSafePath(targetPath);

    if (safePath === this.serverRoot) {
      throw new Error('Cannot delete server root directory');
    }

    if (!fs.existsSync(safePath)) {
      return;
    }

    const stats = fs.statSync(safePath);
    if (stats.isDirectory()) {
      fs.rmSync(safePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(safePath);
    }
  }

  public renamePath(oldPath: string, newPath: string): void {
    const safeOld = this.resolveSafePath(oldPath);
    const safeNew = this.resolveSafePath(newPath);

    if (!fs.existsSync(safeOld)) {
      throw new Error(`Source path not found: ${oldPath}`);
    }

    fs.renameSync(safeOld, safeNew);
  }

  public searchFiles(query: string, currentDir: string = ''): FileItem[] {
    const targetDir = this.resolveSafePath(currentDir);
    const results: FileItem[] = [];

    const walk = (dir: string) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(dir, item.name);
        const rel = path.relative(this.serverRoot, full).replace(/\\/g, '/');

        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          let size = 0;
          let mtime = new Date().toISOString();
          try {
            const st = fs.statSync(full);
            size = st.size;
            mtime = st.mtime.toISOString();
          } catch {}

          results.push({
            name: item.name,
            path: rel,
            isDirectory: item.isDirectory(),
            sizeBytes: size,
            updatedAt: mtime,
            isImportant: SandboxedFileSystem.IMPORTANT_FILES.has(item.name),
          });
        }

        if (item.isDirectory() && results.length < 100) {
          try {
            walk(full);
          } catch {}
        }
      }
    };

    walk(targetDir);
    return results;
  }
}
