import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let _idCounter = 0;

/**
 * Toast variants: 'success' | 'error' | 'warning' | 'info'
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.warning('Not enough watering cans');
 *   toast.info('Tip: complete Pomodoro to earn rewards');
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    // Mark as exiting first (for exit animation)
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));

    // Actually remove after animation duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }, 320);
  }, []);

  const addToast = useCallback((message, variant = 'info', duration = 4000) => {
    const id = ++_idCounter;

    setToasts((prev) => {
      // Limit to 5 visible toasts, remove oldest if needed
      const next = prev.length >= 5 ? prev.slice(1) : prev;
      return [...next, { id, message, variant, exiting: false }];
    });

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback((message, variant, duration) => addToast(message, variant, duration), [addToast]);
  toast.success = (msg, dur) => addToast(msg, 'success', dur);
  toast.error = (msg, dur) => addToast(msg, 'error', dur ?? 5000);
  toast.warning = (msg, dur) => addToast(msg, 'warning', dur);
  toast.info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — rendered at root level */}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast-item toast-${t.variant} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}
              role="alert"
            >
              <div className="toast-icon">
                {t.variant === 'success' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {t.variant === 'error' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
                {t.variant === 'warning' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
                {t.variant === 'info' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>
              <span className="toast-message">{t.message}</span>
              <button
                className="toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
