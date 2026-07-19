import { Connection, Keypair, PublicKey, Transaction, Ed25519Program } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor';
import { getNetworkConfig } from '@txline-monorepo/shared/dist/config';
import * as fs from 'fs';
import * as path from 'path';

const config = getNetworkConfig(process.env.NETWORK || 'devnet');
const connection = new Connection(config.rpcUrl, 'confirmed');

// System settlement dispatch authority credentials mapping
const authorityWalletFile = process.env.ORACLE_AUTHORITY_KEYPAIR || '#/secrets/oracle.json';
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(authorityWalletFile, 'utf-8')));
const signerKeyPair = Keypair.fromSecretKey(secretKey);

const idlPath = path.resolve(__dirname, '../../../programs/settlement/target/idl/settlement.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));

const provider = new AnchorProvider(connection, new Wallet(signerKeyPair), { commitment: 'confirmed' });
const settlementProgram = new Program(idl as Idl, provider);

export async function settleOnChainMarket(
  matchId: string,
  outcome: number,
  totalGoals: number,
  txlineSignature: number[]
) {
  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('market'), Buffer.from(matchId)],
    settlementProgram.programId
  );

  const payloadBuffer = Buffer.from(`${matchId}-${outcome}-${totalGoals}`);
  
  // Construct a transaction matching the Ed25519 instruction verification rule
  const tx = new Transaction();
  
  tx.add(
    Ed25519Program.createInstructionWithPublicKey({
      publicKey: signerKeyPair.publicKey.toBytes(),
      message: payloadBuffer,
      signature: Uint8Array.from(txlineSignature),
    })
  );

  const settleInstruction = await settlementProgram.methods
    .settleMarketWithProof(matchId, outcome, totalGoals, Array(32).fill(0))
    .accountsStrict({
      market: marketPda,
      globalState: PublicKey.findProgramAddressSync([Buffer.from('state')], settlementProgram.programId)[0],
      ixSysvar: new PublicKey('Sysvar1nstructions1111111111111111111111111'),
    })
    .instruction();

  tx.add(settleInstruction);

  const txHash = await connection.sendTransaction(tx, [signerKeyPair]);
  console.log(`[Solana On-Chain Settlement Successful] Signature Hash tracking reference ID: ${txHash}`);
}
