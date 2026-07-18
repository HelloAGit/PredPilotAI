import dotenv from 'dotenv';
import EventSource from 'eventsource';
import axios from 'axios';
import { getNetworkConfig } from '@txline-monorepo/shared/dist/config';
import { settleOnChainMarket } from './solana-settler';

dotenv.config();
const config = getNetworkConfig(process.env.NETWORK || 'devnet');

async function acquireTxLineToken(): Promise<string> {
  if (config.txlineToken && !config.txlineToken.startsWith('mock')) {
    return config.txlineToken;
  }
  // Step 1: Fallback onto Guest JWT activation endpoint sequence if custom token is omitted
  console.log(`[TxLINE] Fetching activation context token from ${config.txlineGuestJwtUrl}`);
  const response = await axios.post(config.txlineGuestJwtUrl);
  return response.data.token;
}

async function runWorker() {
  const activeToken = await acquireTxLineToken();
  const targetStreamUrl = `${config.txlineApiHost}/v1/stream/worldcup?token=${activeToken}`;
  
  console.log(`[Worker] Directing connection pipeline into: ${targetStreamUrl}`);
  const eventStream = new EventSource(targetStreamUrl);

  eventStream.onmessage = async (event) => {
    try {
      const parsedUpdate = JSON.parse(event.data);
      console.log(`[Event Received] Type: ${parsedUpdate.type} ID: ${parsedUpdate.eventId}`);

      // Handle fixture configuration synchronizations
      if (parsedUpdate.type === 'FIXTURE_SYNC') {
        console.log(`[Fixture Sync] Mapping ${parsedUpdate.homeTeam} vs ${parsedUpdate.awayTeam}`);
      }

      // Handle real-time updates and trigger on-chain resolutions when finalized markers match
      if (parsedUpdate.type === 'SCORE_UPDATE' && parsedUpdate.status === 'FINISHED') {
        console.log(`[Finalised Match Marker] Verification pipeline ready for ID: ${parsedUpdate.eventId}`);
        
        // Fetch explicit cryptographic proof validation bytes from TxLINE route
        const proofRoute = `${config.txlineApiHost}/v1/proofs/${parsedUpdate.eventId}`;
        const proofResponse = await axios.get(proofRoute, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        const { signatureBytes, resultPayload } = proofResponse.data;

        await settleOnChainMarket(
          parsedUpdate.eventId,
          resultPayload.outcome, // 1=Home, 2=Away, 3=Draw
          resultPayload.totalGoals,
          signatureBytes
        );
      }
    } catch (err) {
      console.error('[Ingest Error] Engine processing failure:', err);
    }
  };

  eventStream.onerror = (error) => {
    console.error('[SSE Error Channel] Pipeline connection disrupted:', error);
  };
}

runWorker().catch(console.error);
