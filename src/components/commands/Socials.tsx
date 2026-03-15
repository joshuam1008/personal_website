import React, { useContext, useEffect } from 'react';
import { termContext } from '../termContext';
import { SOCIALS } from '../../data/socials';

const Socials: React.FC = () => {
  const { arg, rerender } = useContext(termContext);

  const subCmd = arg[0]?.toLowerCase();
  const targetNum = parseInt(arg[1] ?? '', 10);

  useEffect(() => {
    if (rerender && subCmd === 'go' && !isNaN(targetNum)) {
      const social = SOCIALS[targetNum - 1];
      if (social) window.open(social.url, '_blank', 'noopener,noreferrer');
    }
  }, [rerender]);

  if (subCmd && !['list', 'go'].includes(subCmd)) {
    return (
      <div className="term-error">
        Unknown sub-command: <strong>{subCmd}</strong>
        <div className="term-dim" style={{ marginTop: '0.25rem' }}>
          Usage: <span className="term-accent3">socials</span> | <span className="term-accent3">socials go &lt;n&gt;</span>
        </div>
      </div>
    );
  }

  if (subCmd === 'go') {
    if (isNaN(targetNum) || targetNum < 1 || targetNum > SOCIALS.length) {
      return (
        <div className="term-error">
          Invalid number. Use 1 to {SOCIALS.length}.
          <div className="term-dim">Usage: <span className="term-accent3">socials go &lt;n&gt;</span></div>
        </div>
      );
    }
    return <div className="term-dim">Opening <span className="term-accent2">{SOCIALS[targetNum - 1].name}</span>...</div>;
  }

  return (
    <div data-testid="socials">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>
        Find me online. Use <span className="term-accent3">socials go &lt;n&gt;</span> to open one.
      </p>
      {SOCIALS.map((s) => (
        <div className="term-list-item" key={s.id}>
          <span className="term-list-num">{s.id}.</span>
          <div className="term-list-body">
            <span className="term-list-title">{s.name}</span>
            {'  '}
            <a className="term-link" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Socials;
