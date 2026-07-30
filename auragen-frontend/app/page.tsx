'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [clickCount, setClickCount] = useState(0);
  const [frictionScore, setFrictionScore] = useState(0);
  const [injectedCode, setInjectedCode] = useState<string | null>(null);
  const [isMorphed, setIsMorphed] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mouseMovesRef = useRef<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8080');
    socketRef.current = socket;

    socket.onopen = () => console.log('Telemetry pipeline open.');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'SCORE_UPDATE') {
        setFrictionScore(data.score);
      }

      if (data.type === 'MORPH_UI_COMMAND') {
        setIsMorphed(true);
        setInjectedCode(data.componentCode);
      }
    };

    return () => socket.close();
  }, []);

  // 1. Rage Click Handler
  const handleButtonClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'RAGE_CLICK' }));
      }
      setClickCount(0);
    }
  };

  // 2. Dead Click Handler (Clicking non-interactive text)
  const handleDeadClick = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !isMorphed) {
      socketRef.current.send(JSON.stringify({ type: 'DEAD_CLICK' }));
    }
  };

  // 3. Mouse Thrashing (Erratic movement tracking)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMorphed) return;

    const now = Date.now();
    const history = mouseMovesRef.current.filter((m) => now - m.time < 500);
    history.push({ x: e.clientX, y: e.clientY, time: now });
    mouseMovesRef.current = history;

    if (history.length > 25) {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'MOUSE_THRASHING' }));
      }
      mouseMovesRef.current = [];
    }
  };

  return (
    <div 
      className="flex min-h-screen bg-gray-100"
      onMouseMove={handleMouseMove}
    >
      {/* Left Sidebar Layout */}
      <div className="w-80 bg-gray-200 border-r border-gray-300 p-6 text-center flex flex-col items-center shadow-inner">
        <h1 className="text-2xl font-bold text-black leading-tight mb-2">
          AuraGen Telemetry
        </h1>

        {/* Live Friction Meter */}
        <div className="w-full bg-white p-3 rounded-lg border mb-6 shadow-sm">
          <div className="flex justify-between text-xs font-semibold mb-1 text-gray-700">
            <span>Friction Score</span>
            <span>{frictionScore} / 100</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                frictionScore > 60 ? 'bg-red-500' : frictionScore > 30 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${frictionScore}%` }}
            />
          </div>
        </div>

        <p 
          onClick={handleDeadClick}
          className="text-xs text-gray-500 mb-6 cursor-pointer select-none border border-dashed border-gray-300 p-2 rounded hover:bg-gray-100"
        >
          💡 Click static text to test <b>Dead Clicks</b> or shake mouse for <b>Thrashing</b>.
        </p>

        {!isMorphed ? (
          <button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 text-white py-3 px-2 rounded text-sm font-medium hover:bg-blue-700 transition"
          >
            Interactive Portal Form ({clickCount})
          </button>
        ) : (
          <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-4 text-left shadow">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-3">
              ✨ Self-Healed UI Morphed
            </span>
            <div 
              dangerouslySetInnerHTML={{ __html: injectedCode || '' }}
            />
          </div>
        )}
      </div>

      {/* Main Panel Right */}
      <div className="flex-1 p-8 flex items-center justify-center">
        {isMorphed ? (
          <div className="p-8 bg-white border border-green-300 rounded-2xl shadow-lg max-w-lg w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Conversational Assistance Wizard
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              High cognitive friction detected! We simplified the portal form into step-by-step guidance.
            </p>
            <div 
              className="p-4 bg-gray-50 rounded-xl border text-left"
              dangerouslySetInnerHTML={{ __html: injectedCode || '' }}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-sm">Trigger friction (rapid clicks, dead clicks, or mouse thrashing) to reach <b>70 points</b>...</p>
          </div>
        )}
      </div>
    </div>
  );
}