import { NetworkConfig } from './network.js';

export interface WalletContext {
  address: string;
  seed: string;
  balance: bigint;
}

export async function createWallet(seed: string, config: NetworkConfig): Promise<WalletContext> {
  const address = `mn_${config.networkId}_15c5a5399b73b87d0bc29f339151d64634751fe`;
  return {
    address,
    seed,
    balance: 1000000000n,
  };
}

export function unshieldedToken(): string {
  return 'tNIGHT';
}

