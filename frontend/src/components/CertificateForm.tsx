import React, { useState } from 'react';
import { CertificateVerifierContract, CertWitness } from '../contracts/managed/CertificateVerifier/index';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface ProofResult {
  nullifier: string;
  timestamp: string;
}

export const CertificateForm: React.FC<{
  onVerificationSuccess: (nullifier: string) => void;
}> = ({ onVerificationSuccess }) => {
  const [secretKeyInput, setSecretKeyInput] = useState('sppu_secret_key_9876543210123456');
  const [studentIdInput, setStudentIdInput] = useState('SPPU2024CS089');
  const [degreeName, setDegreeName] = useState('B.Tech Computer Engineering');
  const [gpaScoreInput, setGpaScoreInput] = useState('3.85');
  const [minGpaInput, setMinGpaInput] = useState('3.50');

  const [isProving, setIsProving] = useState(false);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProving(true);
    setErrorMsg(null);
    setProofResult(null);

    try {
      // Scale GPA score to integer (3.85 -> 385)
      const gpaScore = Math.round(parseFloat(gpaScoreInput) * 100);
      const minGpa = Math.round(parseFloat(minGpaInput) * 100);

      // Convert private inputs into raw 32-byte witness arrays (used at runtime for proof generation and immediately dropped)
      const encoder = new TextEncoder();
      const secretBytes = new Uint8Array(32);
      secretBytes.set(encoder.encode(secretKeyInput).slice(0, 32));

      const idBytes = new Uint8Array(32);
      idBytes.set(encoder.encode(studentIdInput).slice(0, 32));

      const witness: CertWitness = {
        studentSecret: secretBytes,
        studentId: idBytes,
        degreeCode: 101,
        gpaScore: gpaScore,
      };

      // Call Compact ZK Circuit
      const contract = new CertificateVerifierContract();
      const nullifierBytes = await contract.verifyDegreePrivacy(witness, minGpa);

      const nullifierHex = `0x${Array.from(nullifierBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;

      setProofResult({
        nullifier: nullifierHex,
        timestamp: new Date().toLocaleTimeString(),
      });

      onVerificationSuccess(nullifierHex);
    } catch (err: any) {
      console.error('Proof generation error:', err);
      setErrorMsg(err?.message || 'Verification proof failed. Check qualification constraints.');
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <ShieldCheck color="var(--primary)" size={24} /> Student Privacy Proof Generator
      </div>

      {/* Mandatory Privacy Label */}
      <div className="privacy-proof-label">
        <Lock size={16} /> Proved without revealing your input
      </div>

      <form onSubmit={handleGenerateProof}>
        <div className="form-group">
          <label className="form-label">Degree Name</label>
          <input
            type="text"
            className="form-input"
            value={degreeName}
            onChange={(e) => setDegreeName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Private Student ID (SPPU Roll Number)</label>
          <input
            type="text"
            className="form-input"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            placeholder="e.g. SPPU2024CS089"
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Kept 100% private. Never broadcast on-chain.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Private GPA Score (0.00 - 4.00)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4.00"
            className="form-input"
            value={gpaScoreInput}
            onChange={(e) => setGpaScoreInput(e.target.value)}
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Proved GPA &gt;= threshold without revealing exact score.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Employer Required Min GPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4.00"
            className="form-input"
            value={minGpaInput}
            onChange={(e) => setMinGpaInput(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isProving}>
          {isProving ? (
            <>
              <Loader2 className="spin" size={18} /> Generating ZK Proof...
            </>
          ) : (
            <>
              <ShieldCheck size={18} /> Generate & Verify ZK Proof
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      {proofResult && (
        <div className="result-card">
          <div className="result-title">
            <CheckCircle2 size={20} /> Zero-Knowledge Proof Validated!
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Your degree qualification was proved on Midnight blockchain. No personal data was disclosed.
          </p>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Disclosed Proof Nullifier:
          </div>
          <div className="result-hash">{proofResult.nullifier}</div>
        </div>
      )}
    </div>
  );
};
