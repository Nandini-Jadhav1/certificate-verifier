import React, { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import Wallet from './components/Wallet';
import { CertificateForm } from './components/CertificateForm';
import { VerifierDashboard } from './components/VerifierDashboard';
import { Shield, Lock } from 'lucide-react';

export function App() {
  const [lastNullifier, setLastNullifier] = useState<string | null>(null);

  return (
    <>
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">Private Student Verification</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Midnight Blockchain • Compact ZK-SNARKs</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <WalletConnect />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-container">
        <header className="hero-banner">
          <span className="hero-tag">
            <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Powered by Midnight Zero-Knowledge Network
          </span>
          <h1 className="hero-title">Private Student Certificate Verification</h1>
          <p className="hero-subtitle">
            Prove your SPPU university degree qualification to employers with complete zero-knowledge data protection.
            Your name, roll number, and exact GPA score are <strong>never exposed on-chain</strong>.
          </p>

          {/* Integrated Web3 Wallet Provider */}
          <Wallet />
        </header>

        <div className="dashboard-grid">
          {/* Student Portal Column */}
          <CertificateForm onVerificationSuccess={(nullifier) => setLastNullifier(nullifier)} />

          {/* Verifier Dashboard Column */}
          <VerifierDashboard lastNullifier={lastNullifier} />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div>
          Built for <strong>INTO the Midnight — SPPU Bootcamp (Rise In)</strong> • Developed with Compact ZK Language & Midnight SDK
        </div>
      </footer>
    </>
  );
}

export default App;
