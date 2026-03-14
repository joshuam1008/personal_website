import React from 'react';
import { COMMANDS } from '../../data/commands';

const Help: React.FC = () => {
  return (
    <div data-testid="help">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>
        Available commands:
      </p>
      {COMMANDS.map(({ cmd, desc }) => (
        <div className="term-help-row" key={cmd}>
          <span className="term-accent3">{cmd}</span>
          <span className="term-dim">{desc}</span>
        </div>
      ))}
      <p className="term-dim" style={{ marginTop: '0.75rem', fontSize: '0.85em' }}>
        Tip: <span className="term-accent3">Ctrl+L</span> also clears the terminal.
      </p>
    </div>
  );
};

export default Help;
