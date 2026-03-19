import { useState, useEffect, useCallback } from 'react';

// ── Toast Item ──

function Toast({ id, message, detail, type = 'info', duration = 4000, onDismiss }) {
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setPhase('visible'));
    return () => cancelAnimationFrame(enterTimer);
  }, []);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setPhase('exiting');
      setTimeout(() => onDismiss(id), 250);
    }, duration);
    return () => clearTimeout(dismissTimer);
  }, [id, duration, onDismiss]);

  const handleClose = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => onDismiss(id), 250);
  }, [id, onDismiss]);

  return (
    <div className={`toast toast--${type} toast--${phase}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {detail && <span className="toast-detail">{detail}</span>}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

// ── Toast Container ──

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
