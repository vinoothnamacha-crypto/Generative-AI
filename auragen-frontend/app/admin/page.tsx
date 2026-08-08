'use client';

import React, { useEffect, useState } from 'react';

interface LiveEvent {
  sessionId: string;
  eventType: string;
  newScore: number;
  timestamp: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [morphCount, setMorphCount] = useState(0);

  useEffect(() => {
    // Connect to your WebSocket telemetry stream
    const adminSocket = new WebSocket('ws://127.0.0.1:8080/admin-stream');

    adminSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'INITIAL_STATE' || data.type === 'SESSION_CREATED' || data.type === 'SESSION_CLOSED') {
        setActiveSessions(data.totalSessions);
      }

      if (data.type === 'LIVE_EVENT') {
        setEvents((prev) => [data, ...prev.slice(0, 19)]);
      }

      if (data.type === 'MORPH_TRIGGERED') {
        setMorphCount((prev) => prev + 1);
      }
    };

    return () => adminSocket.close();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">AuraGen Admin Telemetry Center</h1>
            <p className="text-xs text-slate-400 mt-1">Real-Time Multi-Session Analytics</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">Active Clients</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{activeSessions}</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">Total Morphs</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{morphCount}</span>
            </div>
          </div>
        </header>

        {/* Analytics Feed */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-700 font-semibold text-sm text-slate-300">
            📡 Live Behavioral Telemetry Feed
          </div>
          <div className="p-4 space-y-2">
            {events.length === 0 ? (
              <p className="text-slate-500 text-sm italic text-center py-8">Waiting for client telemetry...</p>
            ) : (
              events.map((ev, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-mono text-blue-400 font-bold">{ev.sessionId}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    {ev.eventType}
                  </span>
                  <span className="text-slate-400">Score: <b className="text-white font-mono">{ev.newScore}/100</b></span>
                  <span className="text-slate-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}