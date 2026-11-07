import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { CloudAgentClient } from '@/lib/agent-client';
import { logAuditEvent } from '@/lib/audit';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;
    const body = await req.json();

    if (user) {
      const perm = await checkServerPermission(user.userId, serverId, Role.MODERATOR);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied: Requires Moderator or higher role' }, { status: 403 });
      }
    }

    const command = body.command;
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Missing command payload' }, { status: 400 });
    }

    // Sanitize command: reject shell injection vectors
    const cleanCommand = command.replace(/^[/]/, '').trim();
    if (/[;&|`$><]/.test(cleanCommand)) {
      return NextResponse.json({ error: 'Forbidden: Character sequence blocked for security' }, { status: 400 });
    }

    // Send through RCON / Agent
    const res = await CloudAgentClient.sendCommand(serverId, cleanCommand);

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: 'EXEC_COMMAND',
      details: `/${cleanCommand}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      response: res.data?.response || `Command /${cleanCommand} processed`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
