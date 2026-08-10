import { CertificateVerifierContract } from '../contracts/managed/CertificateVerifier/index.js';
import { resolveNetwork, loadState } from './network.js';

async function main() {
  console.log('=== Midnight Certificate Verifier CLI ===');
  const { network } = resolveNetwork();
  const state = loadState();
  const deployment = state.deployments[network];

  console.log(`Active Network: ${network}`);
  console.log(`Contract ID: ${deployment?.address || 'Not deployed yet'}`);

  const contract = new CertificateVerifierContract();
  console.log('\nContract State:');
  console.log(`- Verification Count: ${contract.ledger.verificationCount}`);
  console.log(`- Issuer Public Key: ${Buffer.from(contract.ledger.issuerPublicKey).toString('hex')}`);
}

main().catch(console.error);
