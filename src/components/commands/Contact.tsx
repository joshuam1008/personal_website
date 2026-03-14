import React from 'react';

const Contact: React.FC = () => {
  return (
    <div data-testid="contact">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>Get in touch:</p>
      <div className="term-list-item">
        <span className="term-list-num">→</span>
        <div>
          <span className="term-list-title">Email  </span>
          <a className="term-link" href="mailto:joshuamason1008@gmail.com">
            joshuamason1008@gmail.com
          </a>
        </div>
      </div>
      <div className="term-list-item">
        <span className="term-list-num">→</span>
        <div>
          <span className="term-list-title">LinkedIn  </span>
          <a className="term-link" href="https://www.linkedin.com/in/joshuam1008/" target="_blank" rel="noreferrer">
            linkedin.com/in/joshuam1008
          </a>
        </div>
      </div>
      <div className="term-list-item">
        <span className="term-list-num">→</span>
        <div>
          <span className="term-list-title">GitHub  </span>
          <a className="term-link" href="https://github.com/joshuam1008" target="_blank" rel="noreferrer">
            github.com/joshuam1008
          </a>
        </div>
      </div>
      <p className="term-dim" style={{ marginTop: '0.75rem', fontSize: '0.85em' }}>
        I typically respond within a day or two. Happy to connect about AI agents, agentic search, or evaluations/guardrails.
      </p>
    </div>
  );
};

export default Contact;
