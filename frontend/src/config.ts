/**
 * Midnight Certificate Verifier Network & Contract Configuration
 */

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || '0xmn_cert_verifier_19fe5a065dc_cd2a76def0';

export const NETWORK =
  import.meta.env.VITE_NETWORK || 'preview';

export const INDEXER_URL =
  import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network/api/v4/graphql';

export const DEPLOYER_ADDRESS =
  '0xmn_cd2a76def08258ae90e6b65cfcb1fc9bd8012b46';
