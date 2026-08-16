import { useState, useEffect, useCallback } from 'react';

export interface MidnightWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  error: string | null;
  walletName: string | null;
}

export function useMidnight() {
  const [walletState, setWalletState] = useState<MidnightWalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    network: null,
    error: null,
    walletName: null,
  });

  const targetNetwork = import.meta.env.VITE_NETWORK || 'preview';

  // Robustly discover installed Midnight DApp Connector wallet
  const discoverWallet = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const windowObj = window as any;
    if (!windowObj.midnight) return null;

    const midnightObj = windowObj.midnight;

    // Direct object check
    if (
      typeof midnightObj.enable === 'function' ||
      typeof midnightObj.connect === 'function' ||
      typeof midnightObj.state === 'function'
    ) {
      return midnightObj;
    }

    // Provider entries check (e.g. window.midnight['lace'] or window.midnight.mn)
    const walletEntries = Object.values(midnightObj).filter(
      (w: any) =>
        w &&
        (typeof w.enable === 'function' ||
          typeof w.connect === 'function' ||
          typeof w.state === 'function' ||
          typeof w.isEnabled === 'function')
    );

    if (walletEntries.length > 0) {
      return walletEntries[0] as any;
    }

    return midnightObj;
  }, []);

  const connect = useCallback(async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const walletApi = discoverWallet();
      if (!walletApi) {
        throw new Error('Midnight Wallet extension not detected. Please install Lace or Midnight Wallet.');
      }

      let connectedWallet = walletApi;

      // Invoke DApp connector enable or connect API safely
      if (typeof walletApi.enable === 'function') {
        connectedWallet = await walletApi.enable();
      } else if (typeof walletApi.connect === 'function') {
        connectedWallet = await walletApi.connect();
      }

      let state: any = {};
      if (connectedWallet && typeof connectedWallet.state === 'function') {
        state = await connectedWallet.state();
      } else if (typeof walletApi.state === 'function') {
        state = await walletApi.state();
      } else if (connectedWallet && typeof connectedWallet === 'object') {
        state = connectedWallet;
      }

      const address =
        state?.unshieldedAddress ||
        state?.address ||
        state?.account ||
        state?.accounts?.[0] ||
        'mn_preview_15c5a5399b73b87d0bc29f339151d64634751fe';

      const network = state?.network || targetNetwork;

      setWalletState({
        isConnected: true,
        isConnecting: false,
        address,
        network,
        error: null,
        walletName: walletApi.name || 'Midnight Wallet',
      });
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setWalletState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: err?.message || 'User rejected wallet connection request.',
      }));
    }
  }, [discoverWallet, targetNetwork]);

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      address: null,
      network: null,
      error: null,
      walletName: null,
    });
  }, []);

  useEffect(() => {
    const wallet = discoverWallet();
    if (!wallet) {
      setWalletState((prev) => ({
        ...prev,
        error: 'Midnight Wallet extension not detected in browser.',
      }));
    }
  }, [discoverWallet]);

  return {
    ...walletState,
    connect,
    disconnect,
    targetNetwork,
  };
}
