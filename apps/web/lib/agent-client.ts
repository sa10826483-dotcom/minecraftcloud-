const CLOUD_API_URL = process.env.CLOUD_API_URL || 'http://localhost:8443';
const CLOUD_API_KEY = process.env.CLOUD_API_KEY || 'minecraftcloud-super-secret-node-key-2026';

export class CloudAgentClient {
  private static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; data: T; error?: string }> {
    try {
      const url = `${CLOUD_API_URL}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Secret': CLOUD_API_KEY,
          ...(options.headers || {}),
        },
        cache: 'no-store',
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { ok: false, data: json, error: json.error || `Agent error ${res.status}` };
      }

      return { ok: true, data: json };
    } catch (err: any) {
      return { ok: false, data: {} as T, error: err.message };
    }
  }

  public static async provisionServer(payload: {
    serverId: string;
    serverName: string;
    edition: string;
    version: string;
    software: string;
    memoryLimitMb: number;
    cpuLimitCores: number;
    javaPort: number;
    bedrockPort: number;
    rconPort: number;
    rconPassword?: string;
  }) {
    return this.request('/api/servers/provision', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async startServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/start`, { method: 'POST' });
  }

  public static async stopServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/stop`, { method: 'POST' });
  }

  public static async restartServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/restart`, { method: 'POST' });
  }

  public static async killServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/kill`, { method: 'POST' });
  }

  public static async getStats(serverId: string) {
    return this.request(`/api/servers/${serverId}/stats`, { method: 'GET' });
  }

  public static async getLogs(serverId: string, limit: number = 200) {
    return this.request(`/api/servers/${serverId}/logs?limit=${limit}`, { method: 'GET' });
  }

  public static async sendCommand(serverId: string, command: string) {
    return this.request(`/api/servers/${serverId}/command`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  public static async listFiles(serverId: string, path: string = '') {
    return this.request(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`, { method: 'GET' });
  }

  public static async getFileContent(serverId: string, path: string) {
    return this.request(`/api/servers/${serverId}/files/content?path=${encodeURIComponent(path)}`, { method: 'GET' });
  }

  public static async saveFileContent(serverId: string, path: string, content: string) {
    return this.request(`/api/servers/${serverId}/files/content`, {
      method: 'POST',
      body: JSON.stringify({ path, content }),
    });
  }

  public static async createFolder(serverId: string, path: string) {
    return this.request(`/api/servers/${serverId}/files/folder`, {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  public static async deleteFile(serverId: string, path: string) {
    return this.request(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });
  }

  public static async createBackup(serverId: string, type: 'FULL' | 'WORLD_ONLY' | 'CONFIG_ONLY') {
    return this.request(`/api/servers/${serverId}/backups`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  public static async restoreBackup(serverId: string, fileName: string) {
    return this.request(`/api/servers/${serverId}/backups/restore`, {
      method: 'POST',
      body: JSON.stringify({ fileName }),
    });
  }
}
