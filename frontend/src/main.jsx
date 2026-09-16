import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

// Suppress noisy startTime error that blocks scroll (Chrome PerformanceObserver / React scheduler)
if (typeof window !== 'undefined') {
  const isNoise = (msg) => msg && (msg.includes('startTime') || msg.includes('reportAllChanges'));
  // window.onerror returning true suppresses console Uncaught
  window.onerror = (msg) => { if (isNoise(String(msg))) return true; };
  window.addEventListener('error', (e) => {
    if (isNoise(e.message || e.error?.message || '')) { e.preventDefault(); e.stopPropagation(); return true; }
  }, true);
  window.addEventListener('unhandledrejection', (e) => {
    if (isNoise(String(e.reason?.message || e.reason || ''))) { e.preventDefault(); }
  });
  // Patch PerformanceObserver to guard undefined entries (root cause for some Chrome builds)
  if (window.PerformanceObserver) {
    const Orig = window.PerformanceObserver;
    window.PerformanceObserver = function(cb, opts) {
      const wrapped = (list, obs) => {
        try {
          const entries = list.getEntries ? list.getEntries() : [];
          const safeEntries = entries.filter(en => en && typeof en.startTime === 'number');
          if (safeEntries.length === 0) return;
          // rebuild list-like object with safe entries
          const safeList = { getEntries: () => safeEntries, getEntriesByType: list.getEntriesByType ? () => safeEntries : undefined, getEntriesByName: list.getEntriesByName ? () => safeEntries : undefined };
          return cb(safeList, obs);
        } catch {}
      };
      return new Orig(wrapped, opts);
    };
    window.PerformanceObserver.supportedEntryTypes = Orig.supportedEntryTypes;
    window.PerformanceObserver.prototype = Orig.prototype;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

