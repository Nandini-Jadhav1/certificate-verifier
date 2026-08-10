import { describe, it, expect, beforeEach } from 'vitest';
import { CertificateVerifierContract, CertWitness } from '../contracts/managed/CertificateVerifier/index.js';

describe('CertificateVerifier Compact Smart Contract & ZK Proofs', () => {
  let contract: CertificateVerifierContract;

  beforeEach(() => {
    contract = new CertificateVerifierContract();
  });

  it('1. Circuit Logic: successfully verifies degree and generates nullifier when GPA meets requirement', async () => {
    const issuerKey = new Uint8Array(32).fill(0xAA);
    await contract.initializeIssuer(issuerKey);

    const witness: CertWitness = {
      studentSecret: new Uint8Array(32).fill(0x01),
      studentId: new Uint8Array(32).fill(0x09),
      degreeCode: 101, // B.Tech Computer Engineering
      gpaScore: 380,   // 3.80 GPA
    };

    const minGpaRequired = 350; // 3.50 GPA requirement
    const nullifier = await contract.verifyDegreePrivacy(witness, minGpaRequired);

    expect(nullifier).toBeInstanceOf(Uint8Array);
    expect(nullifier.length).toBe(32);
  });

  it('2. State Transition: increments verificationCount on ledger state upon successful verification', async () => {
    expect(contract.ledger.verificationCount).toBe(0n);

    const witness: CertWitness = {
      studentSecret: new Uint8Array(32).fill(0x02),
      studentId: new Uint8Array(32).fill(0x08),
      degreeCode: 102,
      gpaScore: 390,
    };

    await contract.verifyDegreePrivacy(witness, 300);
    expect(contract.ledger.verificationCount).toBe(1n);

    await contract.verifyDegreePrivacy(witness, 300);
    expect(contract.ledger.verificationCount).toBe(2n);
  });

  it('3. Privacy Guarantee: private inputs (studentId, secret, GPA) are NEVER exposed in ledger or output', async () => {
    const witness: CertWitness = {
      studentSecret: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
      studentId: new Uint8Array([99, 88, 77, 66, 55, 44, 33, 22, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]),
      degreeCode: 9999,
      gpaScore: 400,
    };

    const nullifier = await contract.verifyDegreePrivacy(witness, 350);

    // Verify nullifier does not equal raw secret or raw ID
    expect(nullifier).not.toEqual(witness.studentSecret);
    expect(nullifier).not.toEqual(witness.studentId);

    // Verify ledger state contains zero private witness data
    const ledgerStr = JSON.stringify(contract.ledger, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    expect(ledgerStr).not.toContain('studentId');
    expect(ledgerStr).not.toContain('studentSecret');
    expect(ledgerStr).not.toContain('400'); // raw GPA score
  });

  it('4. Constraint Enforcement: rejects verification if student GPA is below minGpa threshold', async () => {
    const witness: CertWitness = {
      studentSecret: new Uint8Array(32).fill(0x03),
      studentId: new Uint8Array(32).fill(0x07),
      degreeCode: 101,
      gpaScore: 290, // 2.90 GPA
    };

    const minGpaRequired = 350; // 3.50 GPA requirement
    await expect(contract.verifyDegreePrivacy(witness, minGpaRequired)).rejects.toThrow(
      'Student GPA score does not meet minimum requirement'
    );
  });
});
