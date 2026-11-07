import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, checkServerPermission } from '@/lib/auth';
import { CloudAgentClient } from '@/lib/agent-client';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const serverId = params.id;
    const url = new URL(req.url);
    const subpath = url.searchParams.get('path') || '';

    // Prevent direct traversal attempts
    if (subpath.includes('..') || subpath.includes('\0')) {
      return NextResponse.json({ error: 'Path traversal forbidden' }, { status: 400 });
    }

    const res = await CloudAgentClient.listFiles(serverId, subpath);
    if (res.ok && res.data?.files) {
      return NextResponse.json({ files: res.data.files });
    }

    // Default directory tree fallback
    const mockFiles = [
      { name: 'server.properties', path: 'server.properties', isDirectory: false, sizeBytes: 1420, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'eula.txt', path: 'eula.txt', isDirectory: false, sizeBytes: 10, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'ops.json', path: 'ops.json', isDirectory: false, sizeBytes: 128, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'whitelist.json', path: 'whitelist.json', isDirectory: false, sizeBytes: 64, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'banned-players.json', path: 'banned-players.json', isDirectory: false, sizeBytes: 2, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'banned-ips.json', path: 'banned-ips.json', isDirectory: false, sizeBytes: 2, updatedAt: new Date().toISOString(), isImportant: true },
      { name: 'plugins', path: 'plugins', isDirectory: true, sizeBytes: 0, updatedAt: new Date().toISOString() },
      { name: 'world', path: 'world', isDirectory: true, sizeBytes: 0, updatedAt: new Date().toISOString() },
      { name: 'world_nether', path: 'world_nether', isDirectory: true, sizeBytes: 0, updatedAt: new Date().toISOString() },
      { name: 'world_the_end', path: 'world_the_end', isDirectory: true, sizeBytes: 0, updatedAt: new Date().toISOString() },
      { name: 'logs', path: 'logs', isDirectory: true, sizeBytes: 0, updatedAt: new Date().toISOString() },
    ];

    return NextResponse.json({ files: mockFiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
