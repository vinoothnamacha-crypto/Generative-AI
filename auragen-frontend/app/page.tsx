'use client';

import { useTelemetry } from '../hooks/useTelemetry';

export default function Dashboard() {
  // This initializes your WebSocket telemetry tracking immediately[cite: 1]
  useTelemetry('user-123'); 

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Secure Financial Portal
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          Please fill out your routing profiles carefully.
        </p>

        <button 
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md transition-all active:scale-95"
        >
          Simulate Frustration (Click Rapidly)
        </button>
      </div>
    </main>
  );
}