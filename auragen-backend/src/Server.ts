import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 AuraGen Telemetry Server running on ws://127.0.0.1:${PORT}`);

// Active session state tracking
let frictionScore = 0;
const FRICTION_THRESHOLD = 70;

wss.on('connection', (ws: WebSocket) => {
  console.log('📡 Telemetry pipeline connected successfully!');
  
  // Reset score on new connection
  frictionScore = 0;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      let pointsAdded = 0;

      // Handle multi-signal telemetry
      switch (data.type) {
        case 'RAGE_CLICK':
          pointsAdded = 35;
          console.log(`🚨 Signal Captured: RAGE CLICK (+${pointsAdded} pts)`);
          break;

        case 'DEAD_CLICK':
          pointsAdded = 20;
          console.log(`⚠️ Signal Captured: DEAD CLICK on static text (+${pointsAdded} pts)`);
          break;

        case 'MOUSE_THRASHING':
          pointsAdded = 25;
          console.log(`🌀 Signal Captured: CURSOR THRASHING (+${pointsAdded} pts)`);
          break;

        default:
          break;
      }

      // Update total friction score
      frictionScore = Math.min(100, frictionScore + pointsAdded);
      console.log(`📊 Current User Friction Score: [ ${frictionScore} / 100 ]`);

      // Broadcast score back to client for real-time visualization
      ws.send(JSON.stringify({ type: 'SCORE_UPDATE', score: frictionScore }));

      // Trigger self-healing when threshold is crossed
      if (frictionScore >= FRICTION_THRESHOLD) {
        console.log('🤖 Friction threshold breached! Triggering Adaptive UI Morphing...');

        const interactiveWizardComponent = `
          <div style="display: flex; flex-direction: column; gap: 12px; text-align: left;">
            <p style="font-size: 13px; color: #374151; font-weight: 600; margin: 0;">
              ✨ Auto-Assisted Smart Portal
            </p>
            <div>
              <label style="font-size: 11px; font-weight: bold; color: #4b5563;">ACCOUNT ID</label>
              <input type="text" placeholder="e.g. ACC-9821" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 11px; font-weight: bold; color: #4b5563;">ISSUE CATEGORY</label>
              <select style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; margin-top: 4px; background: white;">
                <option>Billing & Access Portal</option>
                <option>Data Sync Issue</option>
                <option>General Support</option>
              </select>
            </div>
            <button onclick="alert('Form submitted via Self-Healed Wizard!')" style="width: 100%; background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 4px;">
              Submit Express Ticket
            </button>
          </div>
        `;

        ws.send(JSON.stringify({
          type: 'MORPH_UI_COMMAND',
          componentCode: interactiveWizardComponent
        }));

        // Reset score after morphing
        frictionScore = 0;
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected.');
  });
});