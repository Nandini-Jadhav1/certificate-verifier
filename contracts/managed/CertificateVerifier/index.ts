/**
 * Generated managed Contract interface for CertificateVerifier.compact
 */

export interface CertWitness {
  studentSecret: Uint8Array;
  studentId: Uint8Array;
  degreeCode: number;
  gpaScore: number;
}

export interface CertificateVerifierLedger {
  issuerPublicKey: Uint8Array;
  verificationCount: bigint;
  revocationRoot: Uint8Array;
}

export type CertificateVerifierPrivateState = Record<string, unknown>;

export interface CertificateVerifierCircuits {
  initializeIssuer(newIssuerKey: Uint8Array): Promise<void>;
  verifyDegreePrivacy(witness: CertWitness, minGpa: number): Promise<Uint8Array>;
  revokeCertificate(certHash: Uint8Array): Promise<void>;
}

export class CertificateVerifierContract implements CertificateVerifierCircuits {
  public ledger: CertificateVerifierLedger;
  
  constructor() {
    this.ledger = {
      issuerPublicKey: new Uint8Array(32),
      verificationCount: 0n,
      revocationRoot: new Uint8Array(32),
    };
  }

  async initializeIssuer(newIssuerKey: Uint8Array): Promise<void> {
    if (newIssuerKey.length !== 32) {
      throw new Error("Issuer public key must be 32 bytes");
    }
    this.ledger.issuerPublicKey = new Uint8Array(newIssuerKey);
    this.ledger.verificationCount = 0n;
    this.ledger.revocationRoot = new Uint8Array(32);
  }

  async verifyDegreePrivacy(witness: CertWitness, minGpa: number): Promise<Uint8Array> {
    if (witness.gpaScore < minGpa) {
      throw new Error("Student GPA score does not meet minimum requirement");
    }
    
    const isSecretEmpty = witness.studentSecret.every(b => b === 0);
    const isIdEmpty = witness.studentId.every(b => b === 0);
    if (isSecretEmpty) {
      throw new Error("Invalid student secret key");
    }
    if (isIdEmpty) {
      throw new Error("Invalid student ID");
    }

    const nullifier = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      nullifier[i] = (witness.studentSecret[i % witness.studentSecret.length] ^ 
                      witness.studentId[i % witness.studentId.length] ^ 
                      (i * 17)) & 0xFF;
    }

    this.ledger.verificationCount += 1n;
    return nullifier;
  }

  async revokeCertificate(certHash: Uint8Array): Promise<void> {
    if (certHash.length !== 32) {
      throw new Error("Certificate revocation hash must be 32 bytes");
    }
    this.ledger.revocationRoot = new Uint8Array(certHash);
  }
}

export const contractInstance = new CertificateVerifierContract();
export function ledger(state: any): CertificateVerifierLedger {
  return contractInstance.ledger;
}

export const pureCircuits = {
  initializeIssuer: contractInstance.initializeIssuer.bind(contractInstance),
  verifyDegreePrivacy: contractInstance.verifyDegreePrivacy.bind(contractInstance),
  revokeCertificate: contractInstance.revokeCertificate.bind(contractInstance),
};
