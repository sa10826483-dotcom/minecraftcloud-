import { PrismaClient, Role, ServerEdition, ServerSoftware, ServerState } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding MinecraftCloud database...');

  // Clean old records
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.serverMember.deleteMany();
  await prisma.player.deleteMany();
  await prisma.backup.deleteMany();
  await prisma.plugin.deleteMany();
  await prisma.mod.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.serverStatusRecord.deleteMany();
  await prisma.serverResource.deleteMany();
  await prisma.serverConfig.deleteMany();
  await prisma.server.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = hashPassword('AdminPass123!');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@minecraftcloud.net',
      username: 'admin',
      passwordHash: adminPassword,
      globalRole: Role.ADMIN,
      emailVerified: true,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'owner@minecraftcloud.net',
      username: 'steve',
      passwordHash: hashPassword('Minecraft2026!'),
      globalRole: Role.OWNER,
      emailVerified: true,
    },
  });

  console.log(`Created users: ${adminUser.username}, ${demoUser.username}`);

  // Create Cross-Play Minecraft Server
  const server = await prisma.server.create({
    data: {
      name: 'Diamond Realms Cross-Play',
      description: 'Official Java & Bedrock Cross-Play Survival Server with GeyserMC and Floodgate.',
      edition: ServerEdition.CROSSPLAY,
      version: '1.21.1',
      software: ServerSoftware.PURPUR,
      status: ServerState.ONLINE,
      javaPort: 25565,
      bedrockPort: 19132,
      host: 'play.minecraftcloud.net',
      containerId: 'mc-srv-diamond-realms-01',
      memoryLimitMb: 6144,
      cpuLimitCores: 4.0,
      diskLimitMb: 40960,
      maxPlayers: 50,
      autoRestart: true,
      maxCrashRetries: 3,
      crashCount: 0,
      lastStartedAt: new Date(),
    },
  });

  // Assign Steve as Owner
  await prisma.serverMember.create({
    data: {
      serverId: server.id,
      userId: demoUser.id,
      role: Role.OWNER,
    },
  });

  // Assign Admin as Admin member
  await prisma.serverMember.create({
    data: {
      serverId: server.id,
      userId: adminUser.id,
      role: Role.ADMIN,
    },
  });

  // Create Server Config with Geyser and Floodgate
  await prisma.serverConfig.create({
    data: {
      serverId: server.id,
      motd: '§6§lMinecraftCloud §r§8» §aDiamond Realms §7[1.21.1] §eJava + Bedrock',
      difficulty: 'hard',
      gameMode: 'survival',
      onlineMode: true,
      pvp: true,
      allowFlight: false,
      whiteListEnabled: false,
      viewDistance: 12,
      simulationDistance: 8,
      spawnProtection: 16,
      enableRcon: true,
      rconPort: 25575,
      rconPassword: 'mc-cloud-secure-rcon',
      enableGeyser: true,
      enableFloodgate: true,
      geyserBedrockPort: 19132,
      geyserAddress: '0.0.0.0',
    },
  });

  // Create Initial Resources
  await prisma.serverResource.create({
    data: {
      serverId: server.id,
      cpuUsagePercent: 24.5,
      memoryUsageMb: 3480.0,
      memoryMaxMb: 6144.0,
      diskUsageMb: 8420.0,
      diskMaxMb: 40960.0,
      networkRxMb: 142.8,
      networkTxMb: 389.2,
      tps: 19.98,
      onlinePlayers: 4,
      uptimeSeconds: 86400,
    },
  });

  // Create Default Plugins for Cross-Play
  const plugins = [
    {
      name: 'Geyser-Spigot',
      version: '2.4.2-SNAPSHOT',
      fileName: 'Geyser-Spigot.jar',
      source: 'GEYSERMC',
      isEnabled: true,
      description: 'Enables Minecraft: Bedrock Edition clients to join Minecraft: Java Edition servers.',
      author: 'GeyserMC Team',
    },
    {
      name: 'Floodgate',
      version: '2.2.3-SNAPSHOT',
      fileName: 'floodgate-spigot.jar',
      source: 'GEYSERMC',
      isEnabled: true,
      description: 'Hybrid authentication and skin system for Bedrock players connecting through Geyser.',
      author: 'GeyserMC Team',
    },
    {
      name: 'EssentialsX',
      version: '2.20.1',
      fileName: 'EssentialsX-2.20.1.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'The essential suite for Minecraft servers: economy, teleportation, moderation.',
      author: 'EssentialsX Team',
    },
    {
      name: 'LuckPerms',
      version: '5.4.102',
      fileName: 'LuckPerms-Bukkit-5.4.102.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'Advanced permissions plugin supporting groups, prefixes, and per-world permissions.',
      author: 'Luck',
    },
    {
      name: 'CoreProtect',
      version: '22.4',
      fileName: 'CoreProtect-22.4.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'Fast, efficient data logging and anti-griefing block rollback tool.',
      author: 'Intelli',
    },
    {
      name: 'Chunky',
      version: '1.4.10',
      fileName: 'Chunky-1.4.10.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'Pre-generates chunks to reduce server lag during exploration.',
      author: 'pop4959',
    },
  ];

  for (const p of plugins) {
    await prisma.plugin.create({
      data: {
        serverId: server.id,
        ...p,
      },
    });
  }

  // Create Sample Players (Java & Bedrock)
  const samplePlayers = [
    {
      username: 'AlexMiner',
      uuid: 'c06f8906-4c3e-4b2e-a579-247077a06c59',
      edition: 'JAVA' as const,
      isOnline: true,
      isOp: true,
      isWhitelisted: true,
      isBanned: false,
      ipAddress: '192.168.1.100',
    },
    {
      username: '.XboxGamer99',
      uuid: '00000000-0000-0000-0009-01f4c7821ea9',
      edition: 'BEDROCK' as const,
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      ipAddress: '192.168.1.101',
    },
    {
      username: 'NetherKnight',
      uuid: 'd892f390-3490-4a81-bb0a-493019840294',
      edition: 'JAVA' as const,
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      ipAddress: '192.168.1.102',
    },
    {
      username: '.PocketCraft_MC',
      uuid: '00000000-0000-0000-0009-881bc391f1a2',
      edition: 'BEDROCK' as const,
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      ipAddress: '192.168.1.103',
    },
  ];

  for (const pl of samplePlayers) {
    await prisma.player.create({
      data: {
        serverId: server.id,
        ...pl,
      },
    });
  }

  // Create Sample Schedules
  await prisma.schedule.create({
    data: {
      serverId: server.id,
      name: 'Nightly World Backup',
      cronExpression: '0 4 * * *',
      action: 'BACKUP',
      commandPayload: 'FULL',
      isEnabled: true,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 5),
    },
  });

  await prisma.schedule.create({
    data: {
      serverId: server.id,
      name: 'Daily Restart & Cache Flush',
      cronExpression: '30 4 * * *',
      action: 'RESTART',
      isEnabled: true,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 5.5),
    },
  });

  // Create Sample Backup
  await prisma.backup.create({
    data: {
      serverId: server.id,
      name: 'backup-auto-2026-11-07.tar.gz',
      type: 'FULL',
      sizeBytes: BigInt(842918400),
      filePath: '/backups/mc-srv-diamond-realms-01/backup-auto-2026-11-07.tar.gz',
      checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      status: 'COMPLETED',
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      serverId: server.id,
      userId: demoUser.id,
      action: 'SERVER_CREATE',
      details: 'Created Diamond Realms Cross-Play server with Purpur 1.21.1 and GeyserMC integration',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
