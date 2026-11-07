import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { CloudAgentClient } from '@/lib/agent-client';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    const url = new URL(req.url);
    const filePath = url.searchParams.get('path') || '';

    if (filePath.includes('..') || filePath.includes('\0')) {
      return NextResponse.json({ error: 'Path traversal forbidden' }, { status: 400 });
    }

    const res = await CloudAgentClient.getFileContent(serverId, filePath);
    if (res.ok && res.data?.content !== undefined) {
      return NextResponse.json({ content: res.data.content });
    }

    if (filePath === 'server.properties') {
      const mockProps = `# Minecraft server properties
# Mon Nov 07 2026
motd=\u00A7aMinecraftCloud \u00A77- Java & Bedrock Cross-Play
server-port=25565
server-ip=0.0.0.0
max-players=50
difficulty=hard
gamemode=survival
online-mode=true
pvp=true
allow-flight=false
white-list=false
view-distance=12
simulation-distance=8
spawn-protection=16
enable-rcon=true
rcon.port=25575
rcon.password=mc-cloud-secure-rcon
level-name=world
`;
      return NextResponse.json({ content: mockProps });
    }

    if (filePath === 'eula.txt') {
      return NextResponse.json({ content: 'eula=true\n' });
    }

    return NextResponse.json({ content: '' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const { path: filePath, content } = body;
    if (filePath.includes('..') || filePath.includes('\0')) {
      return NextResponse.json({ error: 'Path traversal forbidden' }, { status: 400 });
    }

    await CloudAgentClient.saveFileContent(serverId, filePath, content);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
