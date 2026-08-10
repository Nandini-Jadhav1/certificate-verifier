import React, { useState } from "react";
import { ethers } from "ethers";
import "./Wallet.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function Wallet() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(network.chainId.toString());

      console.log("Connected:", accounts[0]);
      console.log("Chain ID:", network.chainId.toString());
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setChainId("");
  };

  return (
    <div className="wallet-container">
      {!account ? (
        <button className="connect-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <p>
            <strong>Wallet:</strong>{" "}
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>

          <p>
            <strong>Chain ID:</strong> {chainId}
          </p>

          <button className="disconnect-btn" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default Wallet;
