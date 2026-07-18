# 🏁 TxLINE On-Chain Sports Prediction Settlement Framework

A high-performance monorepo utilizing **TxLINE by TxODDS** streams to fuel immediate, permissionless, cryptographically validated prediction markets directly verified on Solana.

## 🗂️ Workspace Architecture Overview

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js web application with `@solana/wallet-adapter-react` for wallet-connected market creation and live dashboard |
| `services/stream-worker` | Real-time SSE service that ingests `txline.txodds` streams, fetches cryptographic outcome payloads, and settles on-chain markets |
| `programs/settlement` | Solana Anchor program featuring native Ed25519 signature pre-compile checking via the instructions sysvar |
| `packages/shared` | Shared TypeScript configs, Zod validation schemas, and network configuration |

## 📋 Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| pnpm | 9+ |
| Rust + Cargo | latest stable |
| Anchor CLI | 0.30.x |
| Solana CLI | 1.18+ |
| Docker | 24+ (for container deployment) |

## 🛠️ Local Development Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
```

### 3. Build all TypeScript packages

```bash
pnpm run build
```

### 4. Build the Anchor/Rust program

```bash
pnpm run anchor:build
```

### 5. Run the stream-worker service (dev mode)

```bash
pnpm --filter @txline-monorepo/stream-worker dev
```

### 6. Run the Next.js web app (dev mode)

```bash
pnpm --filter @txline-monorepo/web dev
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values. **Never commit `.env` or secret files.**

| Variable | Description | Default |
|----------|-------------|---------|
| `NETWORK` | `devnet` or `mainnet` | `devnet` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | devnet public endpoint |
| `PROGRAM_ID` | Deployed settlement program ID | devnet placeholder |
| `TXLINE_DEVNET_TOKEN` | TxLINE API token for devnet | *(guest JWT fallback)* |
| `TXLINE_MAINNET_TOKEN` | TxLINE API token for mainnet | — |
| `ORACLE_AUTHORITY_KEYPAIR` | Path to oracle signing keypair JSON | `./secrets/oracle.json` |

## 🐳 Docker / Container Deployment

Both services have production Dockerfiles. Build and run them via **Docker Compose** from the repo root.

### Quick start with Docker Compose

```bash
# 1. Copy env template
cp .env.example .env
# Edit .env with real values

# 2. Place oracle keypair (never commit this file!)
mkdir -p secrets
# Copy or generate oracle.json into secrets/oracle.json

# 3. Build and start all services
docker compose up --build -d

# 4. View logs
docker compose logs -f stream-worker
docker compose logs -f web-dashboard
```

The web dashboard will be available at **http://localhost:3000**.

### Build individual images

```bash
# Stream-worker service
docker build -f services/stream-worker/Dockerfile -t txline-stream-worker .

# Web dashboard
docker build -f apps/web/Dockerfile -t txline-web .
```

### Run stream-worker standalone

```bash
docker run --rm \
  --env-file .env \
  -v $(pwd)/secrets:/secrets:ro \
  txline-stream-worker
```

### Run web dashboard standalone

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_NETWORK=devnet \
  txline-web
```

> ⚠️ **Security**: Mount the `secrets/` directory as a read-only volume (`-v ./secrets:/secrets:ro`). Never bake keypairs or tokens into Docker images.

## ⚓ Anchor Program (Rust)

### Build

```bash
pnpm run anchor:build
# or directly:
cd programs/settlement && anchor build
```

### Test

```bash
pnpm run anchor:test
# or directly:
cd programs/settlement && anchor test
```

### Deploy to devnet

```bash
cd programs/settlement
anchor deploy --provider.cluster devnet
```

## 🏗️ Monorepo Build Pipeline

The repo uses [Turborepo](https://turbo.build/) for task orchestration.

```
packages/shared  ──build──▶  services/stream-worker  ──build──▶  Docker image
                          └──────────────────────────▶  apps/web  ──build──▶  Docker image
```

```bash
# Build everything in dependency order
pnpm run build

# Lint everything
pnpm run lint

# Run all tests
pnpm test
```

