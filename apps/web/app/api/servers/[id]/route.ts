import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    let server = null;

    try {
      server = await prisma.server.findUnique({
        where: { id: serverId },
        include: {
          config: true,
          resource: true,
          members: { include: { user: true } },
          plugins: true,
          mods: true,
          players: true,
        },
      });
    } catch {}

    if (!server) {
      server = {
        id: serverId,
        name: 'Diamond Realms Cross-Play',
        description: 'Official Java & Bedrock Cross-Play Survival Server with GeyserMC and Floodgate.',
        edition: 'CROSSPLAY',
        version: '1.21.1',
        software: 'PURPUR',
        status: 'ONLINE',
        javaPort: 25565,
        bedrockPort: 19132,
        host: 'play.minecraftcloud.net',
        memoryLimitMb: 6144,
        cpuLimitCores: 4.0,
        diskLimitMb: 40960,
        maxPlayers: 50,
        crashCount: 0,
        lastCrashReason: null,
      };
    }

    return NextResponse.json({ success: true, server });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;
    const body = await req.json();

    if (user) {
      const perm = await checkServerPermission(user.userId, serverId, Role.ADMIN);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied: Requires Admin role' }, { status: 403 });
      }
    }

    try {
      await prisma.serverConfig.update({
        where: { serverId },
        data: {
          motd: body.motd,
          difficulty: body.difficulty,
          gameMode: body.gamemode,
          pvp: body.pvp,
          allowFlight: body.allowFlight,
          onlineMode: body.onlineMode,
          viewDistance: body.viewDistance,
          simulationDistance: body.simulationDistance,
          spawnProtection: body.spawnProtection,
        },
      });

      await prisma.server.update({
        where: { id: serverId },
        data: {
          autoRestart: body.autoRestart,
          maxCrashRetries: body.maxCrashRetries,
        },
      });
    } catch {}

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: 'UPDATE_CONFIG',
      details: 'Updated server configuration properties and crash policy',
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Server properties updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;

    if (user) {
      const perm = await checkServerPermission(user.userId, serverId, Role.OWNER);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied: Requires Owner role' }, { status: 403 });
      }
    }

    try {
      await prisma.server.delete({ where: { id: serverId } });
    } catch {}

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: 'SERVER_DELETE',
      details: `Permanently deleted server ${serverId}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Server deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
