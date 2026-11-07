# Java + Bedrock Cross-Play (GeyserMC & Floodgate) Setup

## 1. How Cross-Play Works

Minecraft Java Edition and Bedrock Edition use fundamentally different network protocols, rendering engines, and packet architectures:
- **Java Edition**: TCP stream sockets, JSON text formatting, Netty protocol.
- **Bedrock Edition**: UDP RakNet sockets, binary translation, raw Microsoft Xbox Live authentication.

MinecraftCloud integrates **GeyserMC** and **Floodgate 2.x** directly into the container lifecycle:

```
[Bedrock Player (iOS/Android/Console)]
                  │
                  ▼ UDP Port 19132
           ┌──────────────┐
           │   GeyserMC   │  Translates Bedrock Packets <---> Java Packets
           └──────┬───────┘
                  │
           ┌──────┴───────┐
           │  Floodgate   │  Validates Xbox Live token & maps UUID without Java account
           └──────┬───────┘
                  │
                  ▼ Local Pipe
      [Purpur 1.21.1 Java Server Engine]
                  ▲
                  │ TCP Port 25565
[Java Player (PC / Mac / Linux)]
```

---

## 2. Configuration Settings

### Geyser Configuration (`plugins/Geyser-Spigot/config.yml`)

The platform generates this automatically:

```yaml
bedrock:
  address: 0.0.0.0
  port: 19132
  motd1: "MinecraftCloud Cross-Play"
  motd2: "Diamond Realms"
  server-name: "Diamond Realms"
  compression_level: 6
  enable-proxy-connections: true

remote:
  address: auto
  port: 25565
  auth-type: floodgate

floodgate-key-file: key.pem
passthrough-motd: true
passthrough-player-counts: true
```

### Floodgate Configuration (`plugins/floodgate/config.yml`)

```yaml
key: key.pem
username-prefix: "."
replace-spaces: true
default-locale: "en_US"
```

---

## 3. Player Experience Differences

| Feature | Java Player | Bedrock Player |
|---|---|---|
| **Connection Address** | `play.yourdomain.com:25565` | `play.yourdomain.com` (Port `19132`) |
| **Prefix in Chat** | Standard (e.g., `AlexMiner`) | Period prefix (e.g., `.XboxGamer99`) |
| **Skins** | Mojang Java skin server | Bedrock custom skins mapped via Floodgate |
| **Combat Mechanics** | 1.9+ weapon cooldown | Cooldown displayed as title or actionbar |
| **Redstone Mechanics** | Java quasi-connectivity rules | Fully respects Java server redstone ticks |

---

## 4. Version Compatibility Realities

> [!IMPORTANT]
> GeyserMC translates Bedrock protocol packets to Java protocol packets. Because Mojang frequently updates Bedrock Edition protocol numbers every few weeks, the platform includes the `MinecraftCompatibilityChecker` to show supported versions accurately.

- **Recommended Server Engine**: Purpur or Paper 1.21.1
- **Supported Java Clients**: 1.21.1 (or older with ViaVersion installed)
- **Supported Bedrock Clients**: Bedrock 1.21.20 through 1.21.50
