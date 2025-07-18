import React from 'react';
import './RoundCounter.css';

const RoundCounter = ({ current, total }) => {
  if (current === 0 || total === 0) {
    return null; // Don't render if there's no round data
  }

  return (
    <div className="round-counter-widget">
      Round {current} / {total}
    </div>
  );
};

export default RoundCounter;
