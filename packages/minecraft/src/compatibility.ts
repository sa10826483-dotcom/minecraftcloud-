import {
  CompatibilityCheckResult,
  MinecraftEdition,
  MinecraftSoftware,
  VersionInfo,
} from './types';

export const SUPPORTED_VERSIONS: Record<string, VersionInfo> = {
  '1.21.1': {
    version: '1.21.1',
    releaseDate: '2024-08-08',
    javaVersion: 21,
    recommended: true,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'BEDROCK'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.21.20', '1.21.21', '1.21.30', '1.21.40', '1.21.50'],
  },
  '1.21.0': {
    version: '1.21.0',
    releaseDate: '2024-06-13',
    javaVersion: 21,
    recommended: false,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'BEDROCK'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.21.0', '1.21.2', '1.21.20'],
  },
  '1.20.6': {
    version: '1.20.6',
    releaseDate: '2024-04-29',
    javaVersion: 21,
    recommended: false,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'BEDROCK'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.20.80', '1.20.81'],
  },
  '1.20.4': {
    version: '1.20.4',
    releaseDate: '2023-12-07',
    javaVersion: 17,
    recommended: true,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'FORGE', 'BEDROCK'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.20.50', '1.20.51', '1.20.60'],
  },
  '1.20.1': {
    version: '1.20.1',
    releaseDate: '2023-06-12',
    javaVersion: 17,
    recommended: true,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'FORGE'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.20.0', '1.20.10', '1.20.12'],
  },
  '1.19.4': {
    version: '1.19.4',
    releaseDate: '2023-03-14',
    javaVersion: 17,
    recommended: false,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'FORGE'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.19.70', '1.19.80'],
  },
  '1.16.5': {
    version: '1.16.5',
    releaseDate: '2021-01-15',
    javaVersion: 8,
    recommended: false,
    supportedSoftware: ['PAPER', 'PURPUR', 'VANILLA', 'FORGE'],
    geyserCompatible: true,
    supportedBedrockProtocols: ['1.16.220', '1.16.221'],
  },
};

export class MinecraftCompatibilityChecker {
  public static check(
    edition: MinecraftEdition,
    version: string,
    software: MinecraftSoftware
  ): CompatibilityCheckResult {
    const info = SUPPORTED_VERSIONS[version];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!info) {
      return {
        compatible: false,
        edition,
        serverVersion: version,
        software,
        supportedJavaClients: [],
        supportedBedrockClients: [],
        geyserConfigured: false,
        warnings: [`Minecraft version "${version}" is not in the recognized compatibility database.`],
        recommendations: ['Please select a validated version such as 1.21.1 or 1.20.4.'],
      };
    }

    // Check software support for this version
    if (!info.supportedSoftware.includes(software)) {
      warnings.push(
        `${software} is not officially supported or stable on Minecraft ${version}. Supported engines: ${info.supportedSoftware.join(', ')}.`
      );
    }

    let geyserConfigured = false;
    const supportedJavaClients = [version];
    let supportedBedrockClients: string[] = [];

    if (edition === 'CROSSPLAY') {
      if (software === 'BEDROCK') {
        warnings.push(
          'Native Bedrock server cannot run Java plugins or support Java edition clients directly.'
        );
      } else if (software === 'VANILLA') {
        warnings.push(
          'Vanilla server cannot load GeyserMC or Floodgate plugins. Cross-play requires Paper, Purpur, or Fabric with GeyserMC.'
        );
        recommendations.push('Switch server software to Paper or Purpur for optimal Geyser cross-play support.');
      } else if (software === 'FORGE') {
        warnings.push(
          'Forge modded servers require client-side mod parity; Bedrock clients cannot join heavily modded Forge dimensions/blocks without client-side Geyser mappings.'
        );
        recommendations.push('For modded cross-play, keep mods strictly server-side or switch to Purpur.');
      } else {
        geyserConfigured = true;
        supportedBedrockClients = info.supportedBedrockProtocols || ['Latest Bedrock'];
      }
    } else if (edition === 'BEDROCK') {
      supportedBedrockClients = [info.supportedBedrockProtocols?.[0] || 'Latest Bedrock'];
      if (software !== 'BEDROCK') {
        warnings.push(`Selected "${software}" software for Bedrock edition. Use Bedrock Dedicated Server software.`);
      }
    }

    // Java runtime requirement notes
    if (info.javaVersion >= 21) {
      recommendations.push(`Server requires OpenJDK 21 LTS (automatically managed in container runtime).`);
    } else if (info.javaVersion === 17) {
      recommendations.push(`Server requires OpenJDK 17 LTS.`);
    }

    return {
      compatible: warnings.length === 0,
      edition,
      serverVersion: version,
      software,
      supportedJavaClients,
      supportedBedrockClients,
      geyserConfigured,
      warnings,
      recommendations,
    };
  }
}
