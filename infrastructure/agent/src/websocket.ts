import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import { DockerOrchestrator } from './docker';

export class AgentWebSocketServer {
  private wss: WebSocketServer;
  private orchestrator: DockerOrchestrator;
  private clientSubscriptions: Map<WebSocket, string> = new Map();

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.orchestrator = DockerOrchestrator.getInstance();

    this.wss.on('connection', (ws: WebSocket, req) => {
      ws.on('message', (message: string) => {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.action === 'subscribe' && payload.serverId) {
            this.clientSubscriptions.set(ws, payload.serverId);

            // Send recent history buffer immediately
            const history = this.orchestrator.getLogs(payload.serverId, 50);
            ws.send(JSON.stringify({ type: 'history', logs: history }));

            // Attach listener for this server
            const logHandler = (line: string) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'log', line }));
              }
            };

            this.orchestrator.on(`log:${payload.serverId}`, logHandler);

            ws.on('close', () => {
              this.orchestrator.removeListener(`log:${payload.serverId}`, logHandler);
              this.clientSubscriptions.delete(ws);
            });
          }
        } catch {
          // Bad payload
        }
      });
    });

    console.log('[WebSocketServer] Real-time console multiplexer attached to /ws');
  }
}
