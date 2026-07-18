'use client';
import React, { useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export default function CreateMarketPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [matchId, setMatchId] = useState('');
  const [marketType, setMarketType] = useState(0);

  const handleCreate = async () => {
    if (!wallet) return alert('Please connect wallet configuration context.');
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new Program({} as any, provider); // Load compiled IDL JSON configuration context reference 

    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('market'), Buffer.from(matchId)],
      program.programId
    );

    await program.methods.createMarket(matchId, marketType).accountsStrict({
      market: marketPda,
      payer: wallet.publicKey,
      systemProgram: PublicKey.default,
    }).rpc();
    
    alert(`Market initialization successful for transaction ID: ${matchId}`);
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">🆕 Initialize Prediction Market Point</h2>
      <div className="space-y-4 max-w-md">
        <input className="w-full p-2 bg-slate-800 rounded border border-slate-700" placeholder="Match ID (e.g., wc-104)" value={matchId} onChange={e => setMatchId(e.target.value)} />
        <select className="w-full p-2 bg-slate-800 rounded border border-slate-700" value={marketType} onChange={e => setMarketType(Number(e.target.value))}>
          <option value={0}>Winner Market (1X2)</option>
          <option value={1}>Total Goals (Over/Under)</option>
          <option value={2}>First Scorer</option>
        </select>
        <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-bold" onClick={handleCreate}>Initialize On-Chain</button>
      </div>
    </div>
  );
}
