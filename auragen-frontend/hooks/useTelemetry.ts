import { useEffect, useRef } from 'react';

// Notice the word 'export' right here—this is what makes it a module!
export const useTelemetry = (userId: string) => {
  const ws = useRef<WebSocket | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  const clickCount = useRef(0);
  const lastClickTime = useRef(Date.now());

  useEffect(() => {
    // Connect to the backend WebSocket server
    ws.current = new WebSocket('ws://127.0.0.1:8080');

    ws.current.onopen = () => {
      console.log('Telemetry stream established.');
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMousePos.current.time;
      
      if (dt > 100) { 
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocity = distance / dt; 

        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'MOUSE_METRICS',
            userId,
            velocity,
            timestamp: now
          }));
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    const handleMouseDown = () => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime.current;
      
      if (timeSinceLastClick < 300) {
        clickCount.current += 1;
      } else {
        clickCount.current = 1;
      }

      if (clickCount.current >= 3 && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'RAGE_CLICK',
          userId,
          clickCount: clickCount.current,
          timestamp: now
        }));
      }

      lastClickTime.current = now;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      ws.current?.close();
    };
  }, [userId]);
  return{};
};