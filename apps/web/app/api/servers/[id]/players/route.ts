import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;

    if (user) {
      const perm = await checkServerPermission(user.userId, serverId, Role.VIEWER);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
    }

    let players: any[] = [];
    try {
      players = await prisma.player.findMany({
        where: { serverId },
        orderBy: { isOnline: 'desc' },
      });
    } catch {}

    if (user?.role === 'VIEWER') {
      players = players.map((p) => ({ ...p, ipAddress: null }));
    }

    return NextResponse.json({ success: true, players });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
