'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [clickCount, setClickCount] = useState(0);
  const [injectedCode, setInjectedCode] = useState<string | null>(null);
  const [isMorphed, setIsMorphed] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8080');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Telemetry pipeline open.');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'MORPH_UI_COMMAND') {
        setIsMorphed(true);
        setInjectedCode(data.componentCode);
      }
    };

    socket.onclose = () => {
      console.log('Telemetry pipeline closed.');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleClick = () => {
    const newCount = clickCount + 1;
    console.log("Button clicked! Current count:", newCount);
    setClickCount(newCount);

    if (newCount >= 3) {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log("Sending RAGE_CLICK event to backend...");
        socketRef.current.send(JSON.stringify({ type: 'RAGE_CLICK' }));
      } else {
        console.warn("WebSocket is not connected!");
      }
      setClickCount(0);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar Layout */}
      <div className="w-80 bg-gray-200 border-r border-gray-300 p-6 text-center flex flex-col items-center shadow-inner">
        <h1 className="text-2xl font-bold text-black leading-tight mb-2">
          AuraGen Telemetry App
        </h1>
        <p className="text-sm text-gray-700 mb-6">
          Move your cursor quickly or click repeatedly to test.
        </p>

        {!isMorphed ? (
          <button
            onClick={handleClick}
            className="w-full bg-gray-300 border border-gray-400 py-3 px-2 rounded text-sm text-black font-medium hover:bg-gray-400 transition"
          >
            Interactive Portal Form ({clickCount})
          </button>
        ) : (
          <div className="w-full bg-blue-50 border border-blue-300 rounded-lg p-4 text-left shadow">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-2">
              ✨ Self-Healed UI Morphed
            </span>
            <div className="text-sm font-medium text-gray-800">
              {injectedCode}
            </div>
          </div>
        )}
      </div>

      {/* Main Container Right */}
      <div className="flex-1 p-8 flex items-center justify-center">
        {isMorphed ? (
          <div className="p-8 bg-white border border-green-300 rounded-2xl shadow-lg max-w-lg w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Conversational Assistance Wizard
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              High cognitive friction detected! We simplified the portal form into step-by-step guidance.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono text-left overflow-x-auto">
              {injectedCode}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <p>Perform rapid clicks on the left button to trigger UI Morphing...</p>
          </div>
        )}
      </div>
    </div>
  );
}