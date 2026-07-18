'use client';
import React, { useEffect, useState } from 'react';

export default function LiveMatchDashboard() {
  const [liveMatches, setLiveMatches] = useState([
    { matchId: 'wc-102', homeTeam: 'Argentina', awayTeam: 'France', homeScore: 2, awayScore: 1, status: 'LIVE' },
    { matchId: 'wc-103', homeTeam: 'Brazil', awayTeam: 'England', homeScore: 0, awayScore: 0, status: 'LIVE' }
  ]);

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 border-b border-slate-700 pb-2">🔴 TxLINE Active Match Feeds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveMatches.map((match) => (
          <div key={match.matchId} className="bg-slate-800 p-6 rounded-lg border border-emerald-500 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs bg-emerald-600 px-3 py-1 rounded-full animate-pulse font-semibold">LIVE UPDATING</span>
              <span className="text-slate-400 text-xs font-mono">ID: {match.matchId}</span>
            </div>
            <div className="flex justify-around items-center text-xl font-bold">
              <div className="text-center">{match.homeTeam}</div>
              <div className="bg-slate-900 px-4 py-2 rounded text-emerald-400 text-2xl">{match.homeScore} - {match.awayScore}</div>
              <div className="text-center">{match.awayTeam}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
