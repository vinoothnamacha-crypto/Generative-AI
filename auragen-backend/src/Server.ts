import { WebSocketServer, WebSocket } from 'ws';
import { ChatOpenAI } from "@langchain/openai";
import { UI_GENERATION_PROMPT } from './promptTemplate';
import * as dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 8080, host: '127.0.0.1' });

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.2,
  // This explicitly reads your key variable
  openAIApiKey: process.env.OPENAI_API_KEY || "PASTE_YOUR_ACTUAL_OPENAI_KEY_HERE", 
});


const codeGenChain = UI_GENERATION_PROMPT.pipe(model);

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to AuraGen Analytics Node.');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'RAGE_CLICK') {
        console.log(`⚠️ High frustration detected for user ${data.userId}! Triggering Code-Gen Agent...`);
        
        const response = await codeGenChain.invoke({
          frictionPoint: "Complex Credit Card Validation & Routing Numbers Form"
        });

        ws.send(JSON.stringify({
          type: 'MORPH_UI_COMMAND',
          componentCode: response.content
        }));
      }
    } catch (err) {
      console.error('Error handling websocket message:', err);
    }
  });
});

console.log('AuraGen WebSocket Server running on ws://localhost:8080');