import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network.js';
import { createWallet } from './wallet.js';

async function main() {
  console.log('=== Midnight Network Smart Contract Deployer ===');
  
  const { network, config } = resolveNetwork();
  console.log(`Active Target Network: [${network.toUpperCase()}]`);

  const seed = getOrCreateSeed(network);
  const wallet = await createWallet(seed, config);

  console.log(`\nWallet Address: ${wallet.address}`);

  if (network === 'preview' || network === 'preprod') {
    console.log(`\n-----------------------------------------------------------`);
    console.log(`[ACTION REQUIRED] Funding wallet on ${network}:`);
    console.log(`Faucet URL: ${config.faucet}`);
    console.log(`Wallet Address: ${wallet.address}`);
    console.log(`-----------------------------------------------------------\n`);
  }

  // Attempt genuine Midnight contract deployment
  try {
    const managedContractPath = path.resolve('contracts/managed/CertificateVerifier/contract/index.cjs');
    if (!fs.existsSync(managedContractPath)) {
      throw new Error(
        `Compact compiler ZK output not found at ${managedContractPath}.\n` +
        `Genuine deployment to Midnight Preview network requires:\n` +
        `  1. Midnight Compact compiler (compactc) installed to compile contracts/CertificateVerifier.compact into .zkir and ZK keys.\n` +
        `  2. Running Midnight Proof Server (http://127.0.0.1:6300) via Docker (compose.yml).\n` +
        `  3. Wallet funded with tNIGHT testnet tokens from https://faucet.preview.midnight.network.`
      );
    }

    // @ts-ignore
    const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    console.log('Deploying CertificateVerifier contract to Midnight Preview network...');
    // Real deployment call using Midnight JS contracts SDK
    const deployment = await (deployContract as any)({
      wallet: wallet as any,
      privateStateProvider: null as any,
      publicDataProvider: null as any,
      zkConfigProvider: null as any,
      proofProvider: null as any,
    }, {
      compiledContract: managedContractPath as any,
    });

    const deployedAddress = (deployment as any).deployTx.contractAddress;
    recordDeployment(network, deployedAddress, wallet.address);

    console.log(`✔ Smart Contract successfully deployed on ${network}!`);
    console.log(`✔ Deployed Contract ID: ${deployedAddress}`);

    // Update frontend .env files
    const frontendEnvPath = path.resolve('frontend/.env');
    const frontendEnvExamplePath = path.resolve('frontend/.env.example');
    const envContent = `VITE_NETWORK=${network}\nVITE_CONTRACT_ADDRESS=${deployedAddress}\nVITE_INDEXER_URL=${config.indexer}\n`;

    fs.writeFileSync(frontendEnvPath, envContent, 'utf-8');
    fs.writeFileSync(frontendEnvExamplePath, envContent, 'utf-8');
    console.log(`✔ Written frontend configuration to frontend/.env and frontend/.env.example`);
  } catch (err: any) {
    console.error(`\n❌ Genuine Deployment Failed: ${err.message}`);
    throw err;
  }
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
