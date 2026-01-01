import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageContext";
import App from "./App.tsx";
import "./index.css";

// Global error handler for unhandled promise rejections (e.g., MetaMask)
window.addEventListener('unhandledrejection', (event) => {
  // Suppress MetaMask/wallet connection errors to prevent blank screen
  const reason = event.reason;
  const message = reason?.message || String(reason);
  
  // Check for wallet-related errors
  const isWalletError = 
    message.includes('MetaMask') ||
    message.includes('Failed to connect') ||
    message.includes('User rejected') ||
    message.includes('eth_requestAccounts') ||
    message.includes('eth_accounts') ||
    message.includes('wallet_') ||
    reason?.code === 4001 ||
    reason?.code === -32002 || // Already pending
    reason?.code === -32603;   // Internal error
  
  if (isWalletError) {
    console.warn('Wallet connection error (suppressed):', message);
    event.preventDefault();
    return;
  }
  
  // Log other unhandled rejections but don't crash
  console.error('Unhandled promise rejection:', reason);
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
