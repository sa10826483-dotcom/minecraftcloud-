import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'MinecraftCloud Web Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      java: true,
      bedrock: true,
      crossplayGeyser: true,
      dockerAgent: true,
      persistentStorage: true,
    },
  });
}
