import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    let mods: any[] = [];
    try {
      mods = await prisma.mod.findMany({ where: { serverId } });
    } catch {}

    return NextResponse.json({ success: true, mods });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
