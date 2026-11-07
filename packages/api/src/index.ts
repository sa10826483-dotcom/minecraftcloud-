export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServerStatusResponse {
  status: 'ONLINE' | 'OFFLINE' | 'STARTING' | 'STOPPING' | 'CRASHED' | 'PROVISIONING';
  cpuPercentage: number;
  memoryUsageMb: number;
  memoryLimitMb: number;
  diskUsageMb: number;
  diskLimitMb: number;
  networkRxBytes: number;
  networkTxBytes: number;
  tps: number;
  onlinePlayers: number;
  uptimeSeconds: number;
}
