import React from 'react';

// The brand is set in type rather than an image: "Chit" in the brand ink, "Fund" in gold italic
export const Wordmark: React.FC<{ className?: string; tagline?: string; tone?: 'dark' | 'light' }> = ({ className = '', tagline, tone = 'dark' }) => (
  <span className={`wordmark wordmark-${tone} ${className}`}>
    <span className="wordmark-text" translate="no">Chit<em>Fund</em></span>
    {tagline && <small className="wordmark-tagline">{tagline}</small>}
  </span>
);
