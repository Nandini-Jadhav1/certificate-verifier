import React from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { Wallet, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { isConnected, isConnecting, address, network, error, connect, disconnect, targetNetwork } = useMidnight();

  return (
    <div className="nav-actions">
      {/* Network Badge */}
      <div className="network-badge">
        <span className="badge-dot" />
        {network ? network.toUpperCase() : targetNetwork.toUpperCase()} NETWORK
      </div>

      {isConnected && address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.4rem 0.8rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--text-primary)',
            }}
          >
            {address.substring(0, 8)}...{address.substring(address.length - 6)}
          </div>
          <button className="btn btn-secondary" onClick={disconnect} style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
            <LogOut size={16} /> Disconnect
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={connect} disabled={isConnecting} style={{ width: 'auto' }}>
          {isConnecting ? (
            'Connecting Wallet...'
          ) : (
            <>
              <Wallet size={18} /> Connect Midnight Wallet
            </>
          )}
        </button>
      )}

      {error && !isConnected && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '2rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fca5a5',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-main)',
            zIndex: 99,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};
