import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { CloudAgentClient } from '@/lib/agent-client';
import { logAuditEvent } from '@/lib/audit';
import { Role, ServerState } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;

    if (user) {
      const perm = await checkServerPermission(user.userId, serverId, Role.ADMIN);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied: Requires Admin role' }, { status: 403 });
      }
    }

    await CloudAgentClient.restartServer(serverId);

    try {
      await prisma.server.update({
        where: { id: serverId },
        data: {
          status: ServerState.ONLINE,
          lastStartedAt: new Date(),
          crashCount: 0,
        },
      });
    } catch {}

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: 'SERVER_RESTART',
      details: 'Gracefully restarted server process',
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Server restarted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
