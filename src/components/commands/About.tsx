import React from 'react';

const About: React.FC = () => {
  return (
    <div data-testid="about">
      <p>
        Hi, I'm <span className="term-accent">Joshua Mason</span> — ML engineer based in the US.
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        I build <span className="term-accent2">search & relevance systems</span> at Thomson Reuters,
        where I work on production NLP pipelines, RAG architectures, and evaluation frameworks that
        help lawyers surface what they need faster.
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        I'm finishing an <span className="term-accent3">M.S. in Computer Science</span> at NC State,
        with prior experience spanning defense R&D (BAE Systems) and enterprise software (Thomson Reuters).
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        When I'm not deep in embeddings or eval metrics, I'm writing about the intersection of
        ML and product, solving competitive programming problems, and learning languages.
      </p>
      <p className="term-dim" style={{ marginTop: '0.75rem', fontSize: '0.85em' }}>
        Try: <span className="term-accent3">resume</span> · <span className="term-accent3">projects</span> · <span className="term-accent3">skills</span> · <span className="term-accent3">contact</span>
      </p>
    </div>
  );
};

export default About;
