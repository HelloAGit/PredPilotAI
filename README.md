# PredPilotAI
Solana Anchor Program
# 🏁 TxLINE On-Chain Sports Prediction Settlement Framework

A high-performance monorepo utilizing **TxLINE by TxODDS** streams to fuel immediate, permissionless, cryptographically validated prediction markets directly verified on Solana.

## 🗂️ Workspace Architecture Overview
* `apps/web`: Next.js web application equipped with `@solana/wallet-adapter-react`.
* `services/stream-worker`: Real-time SSE service that ingests `txline.txodds` streams, fetches cryptographic outcome payloads, and settles on-chain markets.
* `programs/settlement`: Solana Anchor program featuring native Ed25519 signature pre-compile checking instructions via the instructions sysvar.
* `packages/shared`: Central configurations, validations, schemas, and structural definitions.

## 🛠️ Local Environment Setup
1. Clone this repository to your local runtime engine.
2. Initialize and lock packages:
   ```bash
   pnpm install
