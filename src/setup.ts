import { execSync } from 'node:child_process';
import { resolveNetwork } from './network';

async function setup() {
  console.log('=== Setting up Midnight Private Student Certificate Verification ===');
  
  const { network } = resolveNetwork();
  console.log(`Setting up environment for network: ${network}`);

  console.log('1. Compiling Compact smart contract...');
  execSync('npm run compile', { stdio: 'inherit' });

  console.log('2. Running deploy script...');
  execSync(`npm run deploy -- --network ${network}`, { stdio: 'inherit' });

  console.log('✔ Setup completed successfully!');
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
