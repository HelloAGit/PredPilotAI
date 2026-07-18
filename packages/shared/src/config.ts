export interface NetworkConfig {
  network: 'devnet' | 'mainnet';
  rpcUrl: string;
  programId: string;
  txlineApiHost: string;
  txlineGuestJwtUrl: string;
  txlineToken: string;
}

export const NETWORKS: Record<'devnet' | 'mainnet', NetworkConfig> = {
  devnet: {
    network: 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    programId: process.env.PROGRAM_ID || 'CgM71v9T7NqNExC6Wf9v5J8pXQk2LqZ8S6M67W888888',
    txlineApiHost: 'https://txline-api.devnet.txodds.com',
    txlineGuestJwtUrl: 'https://txline.txodds.com/api/guest/activate',
    txlineToken: process.env.TXLINE_DEVNET_TOKEN || 'mock_devnet_token_abc123'
  },
  mainnet: {
    network: 'mainnet',
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    programId: process.env.PROGRAM_ID || 'AsM71v9T7NqNExC6Wf9v5J8pXQk2LqZ8S6M67W999999',
    txlineApiHost: 'https://api.txline.txodds.com',
    txlineGuestJwtUrl: 'https://txline.txodds.com/api/guest/activate',
    txlineToken: process.env.TXLINE_MAINNET_TOKEN || ''
  }
};

export const getNetworkConfig = (network: string): NetworkConfig => {
  if (network === 'mainnet') return NETWORKS.mainnet;
  return NETWORKS.devnet;
};
