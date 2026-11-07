import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    let schedules: any[] = [];
    try {
      schedules = await prisma.schedule.findMany({ where: { serverId } });
    } catch {}

    return NextResponse.json({ success: true, schedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
