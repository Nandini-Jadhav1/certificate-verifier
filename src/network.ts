import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export type NetworkId = 'undeployed' | 'preview' | 'preprod';

export const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'] as const;

export interface NetworkConfig {
  networkId: NetworkId;
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  faucet: string | null;
  composeServices: string[];
}

export interface DeploymentRecord {
  address: string;
  deployedAt: string;
  deployer: string;
}

export interface NetworkState {
  version: 1;
  activeNetwork: NetworkId;
  wallets: Partial<Record<NetworkId, { seed: string; createdAt: string }>>;
  deployments: Partial<Record<NetworkId, DeploymentRecord>>;
}

export const STATE_FILE_NAME = '.midnight-state.json';
export const STATE_VERSION = 1 as const;

export const NETWORK_CONFIGS: Record<NetworkId, NetworkConfig> = {
  undeployed: {
    networkId: 'undeployed',
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node: 'ws://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
    faucet: null,
    composeServices: ['node', 'indexer', 'proof-server'],
  },
  preview: {
    networkId: 'preview',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://faucet.preview.midnight.network',
    composeServices: ['proof-server'],
  },
  preprod: {
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://faucet.preprod.midnight.network',
    composeServices: ['proof-server'],
  },
};

export function isNetworkId(v: unknown): v is NetworkId {
  return typeof v === 'string' && (NETWORK_IDS as readonly string[]).includes(v);
}

export function loadState(cwd: string = process.cwd()): NetworkState {
  const filePath = path.join(cwd, STATE_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    return {
      version: STATE_VERSION,
      activeNetwork: 'preview',
      wallets: {},
      deployments: {},
    };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {
      version: STATE_VERSION,
      activeNetwork: 'preview',
      wallets: {},
      deployments: {},
    };
  }
}

export function saveState(state: NetworkState, cwd: string = process.cwd()): void {
  const filePath = path.join(cwd, STATE_FILE_NAME);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

export function resolveNetwork(cwd: string = process.cwd()): { network: NetworkId; config: NetworkConfig } {
  const args = process.argv.slice(2);
  const flagIdx = args.indexOf('--network');
  let network: NetworkId = 'preview';

  if (flagIdx !== -1 && args[flagIdx + 1] && isNetworkId(args[flagIdx + 1])) {
    network = args[flagIdx + 1] as NetworkId;
  } else {
    const state = loadState(cwd);
    if (state.activeNetwork) {
      network = state.activeNetwork;
    }
  }

  const state = loadState(cwd);
  if (state.activeNetwork !== network) {
    state.activeNetwork = network;
    saveState(state, cwd);
  }

  return { network, config: NETWORK_CONFIGS[network] };
}

export function getOrCreateSeed(network: NetworkId, cwd: string = process.cwd()): string {
  if (network === 'undeployed') {
    return '0000000000000000000000000000000000000000000000000000000000000001';
  }

  const state = loadState(cwd);
  if (state.wallets[network]?.seed) {
    return state.wallets[network]!.seed;
  }

  const newSeed = crypto.randomBytes(32).toString('hex');
  state.wallets[network] = {
    seed: newSeed,
    createdAt: new Date().toISOString(),
  };
  saveState(state, cwd);
  return newSeed;
}

export function recordDeployment(network: NetworkId, address: string, deployer: string, cwd: string = process.cwd()): void {
  const state = loadState(cwd);
  state.deployments[network] = {
    address,
    deployedAt: new Date().toISOString(),
    deployer,
  };
  saveState(state, cwd);
}
