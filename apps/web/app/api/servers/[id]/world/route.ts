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

    const { action, worldName, seed } = body;
    const cleanWorldName = (worldName || 'world').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanSeed = seed ? seed.toString().trim() : '';

    // Safety backup of world before destructive operations
    await CloudAgentClient.createBackup(serverId, 'WORLD_ONLY');

    if (action === 'GENERATE' || action === 'RESET') {
      // 1. Fetch current server.properties
      const propsRes = await CloudAgentClient.getFileContent(serverId, 'server.properties');
      if (propsRes.ok && propsRes.data?.content) {
        let content: string = propsRes.data.content;

        // Update level-name
        if (/^level-name=.*$/m.test(content)) {
          content = content.replace(/^level-name=.*$/m, `level-name=${cleanWorldName}`);
        } else {
          content += `\nlevel-name=${cleanWorldName}`;
        }

        // Update level-seed
        if (/^level-seed=.*$/m.test(content)) {
          content = content.replace(/^level-seed=.*$/m, `level-seed=${cleanSeed}`);
        } else {
          content += `\nlevel-seed=${cleanSeed}`;
        }

        // Save updated properties
        await CloudAgentClient.saveFileContent(serverId, 'server.properties', content);
      }

      // 2. Check if server is running, if so restart to generate
      const statusRes = await CloudAgentClient.getStats(serverId);
      if (statusRes.ok && statusRes.data?.status === 'ONLINE') {
        await CloudAgentClient.restartServer(serverId);
      }
    }

    await logAuditEvent({
      serverId,
      userId: user?.userId,
      action: `WORLD_${action}`,
      details: `Generated new world: "${cleanWorldName}" with seed: "${cleanSeed || 'Random'}" (server properties updated)`,
      ipAddress: req.ip || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `New world "${cleanWorldName}" configured with seed "${cleanSeed || 'Random'}"! Server will load this world on next boot.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
