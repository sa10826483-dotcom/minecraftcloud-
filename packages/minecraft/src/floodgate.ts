import * as crypto from 'crypto';

export class FloodgateConfigGenerator {
  public static generateYaml(options: {
    usernamePrefix?: string;
    replaceSpaces?: boolean;
    authType?: 'floodgate';
  }): string {
    const prefix = options.usernamePrefix ?? '.';
    const replaceSpaces = options.replaceSpaces ?? true;

    return `# -------------------------------------------------------------
# Floodgate 2.0 Configuration for MinecraftCloud Platform
# Documentation: https://geysermc.org/wiki/floodgate/setup/
# -------------------------------------------------------------

# Key file generated automatically for this server instance
key: key.pem

# Prefix for Bedrock usernames so Java players and plugins distinguish them
username-prefix: "${prefix}"

# Whether to replace spaces with underscores in Bedrock gamertags
replace-spaces: ${replaceSpaces}

default-locale: "en_US"

messages:
  current-locale: "en_US"

# Automatically link Bedrock accounts if enabled
auto-link:
  enabled: false

# Player link database configuration
player-link:
  enabled: false
  type: sqlite

# Metrics
metrics:
  enabled: false
`;
  }

  /**
   * Generates a secure base64-encoded AES/RSA secret key suitable for Floodgate's key.pem
   */
  public static generateKeyPem(): string {
    const key = crypto.randomBytes(256).toString('base64');
    return `-----BEGIN FLOODGATE KEY-----\n${key.match(/.{1,64}/g)?.join('\n')}\n-----END FLOODGATE KEY-----\n`;
  }
}
