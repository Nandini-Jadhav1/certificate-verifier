import { NetworkConfig } from './network';

export interface WalletContext {
  address: string;
  seed: string;
  balance: bigint;
}

export async function createWallet(seed: string, config: NetworkConfig): Promise<WalletContext> {
  const address = `0xmn_${seed.substring(0, 40)}`;
  return {
    address,
    seed,
    balance: 1000000000n,
  };
}

export function unshieldedToken(): string {
  return 'tNIGHT';
}
