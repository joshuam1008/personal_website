import React, { useContext } from 'react';
import { termContext } from '../termContext';

const History: React.FC = () => {
  const { history } = useContext(termContext);

  // history[0] is the most recent command (including the current "history" call itself)
  // Show all entries in chronological order (reverse the array)
  const entries = [...history].reverse();

  if (entries.length === 0) {
    return <div className="term-dim">No command history yet.</div>;
  }

  return (
    <div data-testid="history">
      {entries.map((cmd, i) => (
        <div key={i}>
          <span className="term-dim" style={{ marginRight: '1.5rem' }}>{i + 1}</span>
          <span>{cmd}</span>
        </div>
      ))}
    </div>
  );
};

export default History;
