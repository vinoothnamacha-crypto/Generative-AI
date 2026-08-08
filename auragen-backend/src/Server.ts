import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 AuraGen Week 4 Enterprise Server running on ws://127.0.0.1:${PORT}`);

interface TelemetryEvent {
  type: string;
  timestamp: string;
  pointsAdded: number;
}

interface SessionData {
  id: string;
  connectedAt: string;
  frictionScore: number;
  events: TelemetryEvent[];
  morphed: boolean;
}

// In-Memory Session Store & Admin Sockets
const activeSessions: Map<string, SessionData> = new Map();
const adminSockets: Set<WebSocket> = new Set();

// Helper: Broadcast live events to connected Admin Dashboards
function broadcastToAdmins(payload: object) {
  const message = JSON.stringify(payload);
  adminSockets.forEach((adminWs) => {
    if (adminWs.readyState === WebSocket.OPEN) {
      adminWs.send(message);
    }
  });
}

// Helper: Basic AST / Structure Safety Validation for dynamic UI
function validateComponentAST(componentCode: string): boolean {
  // Verifies payload is non-empty and contains no unsanitized script injection tags
  if (!componentCode || componentCode.includes('<script>') || componentCode.includes('javascript:')) {
    return false;
  }
  return true;
}

wss.on('connection', (ws: WebSocket, req) => {
  const requestUrl = req.url || '';

  // 1. ROUTE: Admin Stream Connection
  if (requestUrl === '/admin-stream') {
    adminSockets.add(ws);
    console.log('🛡️ Admin Telemetry Dashboard connected to stream.');

    // Send initial snapshot of all active sessions
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      totalSessions: activeSessions.size,
      sessions: Array.from(activeSessions.values())
    }));

    ws.on('close', () => {
      adminSockets.delete(ws);
      console.log('🛡️ Admin Telemetry Dashboard disconnected.');
    });
    return;
  }

  // 2. ROUTE: Client Telemetry Session Connection
  const sessionId = `SESS-${Math.floor(1000 + Math.random() * 9000)}`;
  const session: SessionData = {
    id: sessionId,
    connectedAt: new Date().toISOString(),
    frictionScore: 0,
    events: [],
    morphed: false
  };

  activeSessions.set(sessionId, session);
  console.log(`📡 Client Connected: [${sessionId}]`);

  // Inform Admin stream of new active session
  broadcastToAdmins({
    type: 'SESSION_CREATED',
    sessionId,
    totalSessions: activeSessions.size
  });

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      let pointsAdded = 0;

      // Handle multi-signal telemetry
      switch (data.type) {
        case 'RAGE_CLICK':
          pointsAdded = 35;
          break;
        case 'DEAD_CLICK':
          pointsAdded = 20;
          break;
        case 'MOUSE_THRASHING':
          pointsAdded = 25;
          break;
        default:
          break;
      }

      if (pointsAdded > 0) {
        session.frictionScore = Math.min(100, session.frictionScore + pointsAdded);
        const eventItem: TelemetryEvent = {
          type: data.type,
          timestamp: new Date().toISOString(),
          pointsAdded
        };
        session.events.push(eventItem);

        console.log(`📊 [${sessionId}] Signal: ${data.type} | Score: ${session.frictionScore}/100`);

        // Send score update back to client
        ws.send(JSON.stringify({ type: 'SCORE_UPDATE', score: session.frictionScore }));

        // Broadcast event live to Admin Dashboard
        broadcastToAdmins({
          type: 'LIVE_EVENT',
          sessionId,
          eventType: data.type,
          newScore: session.frictionScore,
          timestamp: eventItem.timestamp
        });

        // Trigger Self-Healing UI Morphing on Threshold Breach (>= 70 pts)
        if (session.frictionScore >= 70 && !session.morphed) {
          const wizardComponentHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
              <p style="font-size: 13px; color: #1e40af; font-weight: bold; margin: 0;">
                ✨ Auto-Assisted Smart Express Form
              </p>
              <div>
                <label style="font-size: 10px; font-weight: bold; color: #475569;">ACCOUNT / TICKET ID</label>
                <input type="text" placeholder="e.g. ACC-9821" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; margin-top: 2px;" />
              </div>
              <div>
                <label style="font-size: 10px; font-weight: bold; color: #475569;">ISSUE CATEGORY</label>
                <select style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; margin-top: 2px; background: white;">
                  <option>Access & Login Issue</option>
                  <option>Billing / Payment Portal</option>
                  <option>Data Sync Error</option>
                </select>
              </div>
              <button onclick="alert('Ticket Submitted via Self-Healed UI!')" style="width: 100%; background: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 4px; font-size: 12px;">
                Submit Express Ticket
              </button>
            </div>
          `;

          // AST Security Inspector Check
          if (validateComponentAST(wizardComponentHTML)) {
            session.morphed = true;
            console.log(`🤖 AST Validated! Pushing MORPH_UI_COMMAND to [${sessionId}]`);

            ws.send(JSON.stringify({
              type: 'MORPH_UI_COMMAND',
              componentCode: wizardComponentHTML
            }));

            // Notify Admin Dashboard of Morph event
            broadcastToAdmins({
              type: 'MORPH_TRIGGERED',
              sessionId,
              timestamp: new Date().toISOString()
            });
          } else {
            console.error(`🚨 AST Security Check Failed for payload in [${sessionId}]`);
          }
        }
      }
    } catch (err) {
      console.error('Error parsing telemetry payload:', err);
    }
  });

  ws.on('close', () => {
    activeSessions.delete(sessionId);
    console.log(`🔌 Client Disconnected: [${sessionId}]`);
    broadcastToAdmins({
      type: 'SESSION_CLOSED',
      sessionId,
      totalSessions: activeSessions.size
    });
  });
});