import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Toast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="toast-container" aria-live="polite">
      <div className="toast">
        <CheckCircle2 size={16} color="var(--success)" />
        <span>{message}</span>
      </div>
    </div>
  );
}
