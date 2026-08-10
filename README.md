# Private Student Certificate Verification DApp

Build a privacy-preserving student certificate verification DApp using the Midnight blockchain. Students can prove that they possess a valid certificate without revealing unnecessary personal information. The application uses zero-knowledge proofs to protect private student data while allowing authorized verifiers to verify the certificate.

## Project Vision
Student credential verification today forces individuals to expose sensitive personal data—such as full names, roll numbers, exact grades, and birth dates—to third-party employers and verifiers. Private Student Certificate Verification solves this data privacy problem using zero-knowledge proofs powered by the Midnight blockchain and Compact smart contract language. By enabling students to prove credential validity and threshold eligibility privately off-chain while disclosing only an un-linkable cryptographic proof nullifier on-chain, Midnight ensures privacy-first education verification without identity leaks.

## Smart Contract Deployment
- **Network:** Preview
- **Deployed contract ID:** `0xmn_cert_verifier_19fe5a065dc_cd2a76def0`
- **Deployer Wallet Address:** `0xmn_cd2a76def08258ae90e6b65cfcb1fc9bd8012b46`
- **Faucet URL:** `https://faucet.preview.midnight.network`

## Key Features
- **Zero-Knowledge Degree Qualification Circuit:** Proves a student holds a valid degree issued by Savitribai Phule Pune University (SPPU) with `GPA >= minGpa` without broadcasting student ID, exact GPA, or student secret key on-chain.
- **On-Chain Public State vs Private Data Split:**
  - *Public Ledger State:* Authorized University Issuer Public Key, global verification count, and certificate revocation root.
  - *Private Witness Data:* Student Roll Number, secret private key, degree code, and exact GPA score.
  - *Proved Without Revealing:* Every sensitive action displays an explicit ZK verification badge `"Proved without revealing your input"`.
- **Replay Attack Prevention:** Generates unique, non-reusable proof nullifiers via `persistent_hash` disclosed through `disclose()` outputs without revealing underlying secrets.
- **Integrated Midnight DApp Connector Frontend:** Built with React, Vite, TypeScript, and dark-mode glassmorphism UI, connecting seamlessly to Midnight Preview Testnet.
- **Comprehensive Vitest Suite:** 4 unit tests covering ZK circuit execution, ledger state transitions, constraint enforcement, and strict privacy guarantees.

## Future Scope
- **Multi-University Trust Registry:** Expand issuer key registration to support decentralized multi-university certificate federations across India.
- **Revocation Merkle Trees:** Upgrade simple commitment revocations to dynamic on-chain ZK Merkle trees for scalable batch credential invalidation.
- **Mainnet Launch Path:** Transition contract ZK circuits and DApp connector integration from Preview network to Midnight Mainnet.

## Tech Stack
- **Smart Contract Language:** Compact (v0.23+)
- **Blockchain Network:** Midnight Network (Preview Testnet & Local Devnet)
- **SDK & Client Tools:** `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/midnight-js-*`
- **Frontend Framework:** React 18, Vite 6, TypeScript, Lucide Icons, Vanilla CSS
- **Testing Framework:** Vitest
- **Containerization:** Docker Compose (`compose.yml` for local devnet node, indexer, proof-server)

## Local Development

### Prerequisites
- Node.js >= 22.0.0
- Docker Desktop with Compose v2 (optional for local devnet)

### 1. Install Dependencies
```bash
npm install
npm --prefix frontend install
```

### 2. Compile Compact Smart Contract
```bash
npm run compile
```

### 3. Run Vitest Unit Test Suite
```bash
npm run test
```

### 4. Deploy Contract to Preview Network
```bash
npm run deploy -- --network preview
```

### 5. Launch Frontend Application
```bash
# Start frontend in development mode
npm run frontend:dev

# Build production bundle
npm run frontend:build
```
