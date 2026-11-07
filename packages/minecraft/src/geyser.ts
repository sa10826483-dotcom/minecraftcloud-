import { GeyserConfig } from './types';

export class GeyserConfigGenerator {
  public static generateYaml(options: {
    serverName: string;
    bedrockPort?: number;
    bedrockAddress?: string;
    remotePort?: number;
    remoteAddress?: string;
    motd?: string;
    maxPlayers?: number;
    authType?: 'floodgate' | 'online' | 'offline';
  }): string {
    const bedrockPort = options.bedrockPort ?? 19132;
    const bedrockAddress = options.bedrockAddress ?? '0.0.0.0';
    const remotePort = options.remotePort ?? 25565;
    const remoteAddress = options.remoteAddress ?? 'auto';
    const motd = options.motd ?? 'MinecraftCloud Cross-Play Server';
    const maxPlayers = options.maxPlayers ?? 20;
    const authType = options.authType ?? 'floodgate';

    return `# -------------------------------------------------------------
# GeyserMC Configuration for MinecraftCloud Platform
# Documentation: https://geysermc.org/wiki/geyser/configuration/
# -------------------------------------------------------------

bedrock:
  address: ${bedrockAddress}
  port: ${bedrockPort}
  motd1: "${motd.replace(/"/g, '\\"')}"
  motd2: "MinecraftCloud Cross-Play"
  server-name: "${options.serverName.replace(/"/g, '\\"')}"
  compression_level: 6
  enable-proxy-connections: true
  broadcast-port: ${bedrockPort}

remote:
  address: ${remoteAddress}
  port: ${remotePort}
  auth-type: ${authType}
  use-proxy-protocol: false
  forward-hostname: true

floodgate-key-file: key.pem

saved-user-logins:
  - "none"

passthrough-motd: true
passthrough-player-counts: true
legacy-ping-passthrough: false
ping-passthrough-interval: 3

max-players: ${maxPlayers}
debug-mode: false
allow-third-party-capes: true
allow-third-party-ears: false
show-cooldown: "title"
show-coordinates: true
disable-custom-skulls: false
max-visible-custom-skulls: 128
custom-sky: true

metrics:
  enabled: false

command-suggestions: true
scoreboard-packet-threshold: 20
enable-auto-login: true
`;
  }
}
