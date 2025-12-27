import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageContext";
import App from "./App.tsx";
import "./index.css";

// Global error handler for unhandled promise rejections (e.g., MetaMask)
window.addEventListener('unhandledrejection', (event) => {
  // Suppress MetaMask connection errors to prevent blank screen
  const reason = event.reason;
  if (
    reason?.message?.includes('MetaMask') ||
    reason?.message?.includes('User rejected') ||
    reason?.code === 4001 ||
    reason?.message?.includes('eth_requestAccounts')
  ) {
    console.warn('MetaMask connection rejected or failed:', reason?.message);
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
