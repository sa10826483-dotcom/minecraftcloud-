import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    let plugins: any[] = [];
    try {
      plugins = await prisma.plugin.findMany({ where: { serverId } });
    } catch {}

    return NextResponse.json({ success: true, plugins });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
