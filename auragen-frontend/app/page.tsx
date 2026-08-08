'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ClientApp() {
  const [clickCount, setClickCount] = useState(0);
  const [frictionScore, setFrictionScore] = useState(0);
  const [injectedCode, setInjectedCode] = useState<string | null>(null);
  const [isMorphed, setIsMorphed] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mouseMovesRef = useRef<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8080');
    socketRef.current = socket;

    socket.onopen = () => console.log('Telemetry connection established.');

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

  // 2. Dead Click Handler
  const handleDeadClick = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !isMorphed) {
      socketRef.current.send(JSON.stringify({ type: 'DEAD_CLICK' }));
    }
  };

  // 3. Mouse Thrashing Handler
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
    <div className="flex min-h-screen bg-slate-100" onMouseMove={handleMouseMove}>
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-1">AuraGen Portal</h1>
        <span className="text-xs text-slate-400 mb-6">Client Experience View</span>

        {/* Live Friction Progress Bar */}
        <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 shadow-inner">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
            <span>Friction Score</span>
            <span className="font-mono">{frictionScore} / 100</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                frictionScore >= 70 ? 'bg-red-500' : frictionScore >= 35 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${frictionScore}%` }}
            />
          </div>
        </div>

        <div 
          onClick={handleDeadClick}
          className="text-xs text-slate-500 mb-6 cursor-pointer select-none border border-dashed border-slate-300 p-3 rounded-lg hover:bg-slate-50 text-center"
        >
          💡 Click here for <b>Dead Clicks</b> or shake mouse for <b>Thrashing</b>.
        </div>

        {!isMorphed ? (
          <button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            Submit Portal Form ({clickCount})
          </button>
        ) : (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left shadow-sm">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-3">
              ✨ Self-Healed UI
            </span>
            <div dangerouslySetInnerHTML={{ __html: injectedCode || '' }} />
          </div>
        )}
      </div>

      {/* Main Panel View */}
      <div className="flex-1 p-8 flex items-center justify-center">
        {isMorphed ? (
          <div className="p-8 bg-white border border-blue-200 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Guided Express Support</h2>
            <p className="text-xs text-slate-500 mb-6">Cognitive friction detected! The view automatically adapted into an auto-assisted workflow.</p>
            <div className="p-4 bg-slate-50 rounded-xl border text-left" dangerouslySetInnerHTML={{ __html: injectedCode || '' }} />
          </div>
        ) : (
          <div className="text-slate-400 text-center max-w-sm">
            <p className="text-sm">Perform interactions (rage clicks, dead clicks, or mouse thrashing) to reach <b>70 points</b> and trigger dynamic self-healing UI...</p>
          </div>
        )}
      </div>
    </div>
  );
}