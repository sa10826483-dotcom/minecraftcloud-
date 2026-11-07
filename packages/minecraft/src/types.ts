export type MinecraftEdition = 'JAVA' | 'BEDROCK' | 'CROSSPLAY';

export type MinecraftSoftware =
  | 'PAPER'
  | 'PURPUR'
  | 'VANILLA'
  | 'FABRIC'
  | 'FORGE'
  | 'BEDROCK';

export interface VersionInfo {
  version: string;
  releaseDate: string;
  javaVersion: number; // e.g. 21 for 1.20.5+, 17 for 1.18-1.20.4, 8 for 1.16.5
  recommended: boolean;
  supportedSoftware: MinecraftSoftware[];
  geyserCompatible: boolean;
  supportedBedrockProtocols?: string[];
}

export interface CompatibilityCheckResult {
  compatible: boolean;
  edition: MinecraftEdition;
  serverVersion: string;
  software: MinecraftSoftware;
  supportedJavaClients: string[];
  supportedBedrockClients: string[];
  geyserConfigured: boolean;
  warnings: string[];
  recommendations: string[];
}

export interface ServerProperties {
  'server-port'?: number;
  'server-ip'?: string;
  motd?: string;
  'max-players'?: number;
  difficulty?: 'peaceful' | 'easy' | 'normal' | 'hard';
  gamemode?: 'survival' | 'creative' | 'adventure' | 'spectator';
  'online-mode'?: boolean;
  pvp?: boolean;
  'allow-flight'?: boolean;
  'white-list'?: boolean;
  'view-distance'?: number;
  'simulation-distance'?: number;
  'spawn-protection'?: number;
  'enable-rcon'?: boolean;
  'rcon.port'?: number;
  'rcon.password'?: string;
  'level-name'?: string;
  'level-seed'?: string;
  'level-type'?: string;
  'enable-command-block'?: boolean;
  'allow-nether'?: boolean;
  'generate-structures'?: boolean;
  'max-tick-time'?: number;
  'network-compression-threshold'?: number;
  'enforce-whitelist'?: boolean;
  'sync-chunk-writes'?: boolean;
  [key: string]: unknown;
}

export interface GeyserConfig {
  bedrock: {
    address: string;
    port: number;
    motd1: string;
    motd2: string;
    'server-name': string;
    compression_level: number;
    'enable-proxy-connections': boolean;
  };
  remote: {
    address: string;
    port: number;
    'auth-type': 'floodgate' | 'online' | 'offline';
    'use-proxy-protocol': boolean;
  };
  'floodgate-key-file': string;
  'passthrough-motd': boolean;
  'passthrough-player-counts': boolean;
  'legacy-ping-passthrough': boolean;
  'ping-passthrough-interval': number;
  'max-players': number;
  'debug-mode': boolean;
  'allow-third-party-capes': boolean;
  'show-cooldown': 'title' | 'actionbar' | 'false';
}
