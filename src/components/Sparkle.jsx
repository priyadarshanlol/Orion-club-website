import React from 'react';

// Four-point star used as the ORION ornament (taken from the Core Committee poster).
export default function Sparkle({ className = 'w-4 h-4', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 0 C12.6 7.2 16.8 11.4 24 12 C16.8 12.6 12.6 16.8 12 24 C11.4 16.8 7.2 12.6 0 12 C7.2 11.4 11.4 7.2 12 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}
