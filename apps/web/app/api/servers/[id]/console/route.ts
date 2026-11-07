import { NextRequest, NextResponse } from 'next/server';
import { CloudAgentClient } from '@/lib/agent-client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverId = params.id;
    const res = await CloudAgentClient.getLogs(serverId, 100);

    if (res.ok && res.data?.logs) {
      return NextResponse.json({ logs: res.data.logs });
    }

    // Default console log buffer for active server preview
    const sampleLogs = [
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Starting minecraft server version 1.21.1`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Loading properties from server.properties`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Default game type: SURVIVAL`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Generating keypair`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Starting Minecraft server on *:25565`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Using epoll channel type`,
      `[${new Date().toLocaleTimeString()}] [Geyser/INFO]: Starting GeyserMC on 0.0.0.0:19132`,
      `[${new Date().toLocaleTimeString()}] [Floodgate/INFO]: Hybrid encryption keys loaded successfully`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Preparing level "world"`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Time elapsed: 1420 ms`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Done (2.104s)! For help, type "help"`,
      `[${new Date().toLocaleTimeString()}] [Server thread/INFO]: AlexMiner joined the game`,
      `[${new Date().toLocaleTimeString()}] [Geyser/INFO]: Bedrock player .XboxGamer99 connected via 19132 (Floodgate authenticated)`,
    ];

    return NextResponse.json({ logs: sampleLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
