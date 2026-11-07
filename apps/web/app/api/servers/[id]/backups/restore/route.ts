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
      const perm = await checkServerPermission(user.userId, serverId, Role.ADMIN);
      if (!perm.allowed) {
        return NextResponse.json({ error: 'Permission denied: Requires Admin role' }, { status: 403 });
      }
    }

    const { fileName } = body;
    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName parameter' }, { status: 400 });
    }

    // Call persistent cloud node agent to extract archive into container volume
    await CloudAgentClient.restoreBackup(serverId, fileName);

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: 'RESTORE_BACKUP',
      details: `Restored snapshot archive: ${fileName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Backup restored successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
