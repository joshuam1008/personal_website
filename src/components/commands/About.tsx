import React from "react";

const About: React.FC = () => {
  return (
    <div data-testid="about">
      <p>
        Hi, I'm <span className="term-accent">Joshua Mason</span> — Applied
        Scientist & AI Engineer based in the US.
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        I build{" "}
        <span className="term-accent2">
          agents for taxes, audit, and accounting
        </span>{" "}
        at Thomson Reuters. My work spans RAG architectures, ReACT flows,
        agentic search, coding agents, OTEL observability, and sophisticated
        evaluation frameworks (including human-in-the-loop annotations) to
        ensure answer quality and structural guardrails.
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        I hold an <span className="term-accent3">M.S. in Computer Science</span>{" "}
        from NC State.
      </p>

      <p
        className="term-dim"
        style={{ marginTop: "0.75rem", fontSize: "0.85em" }}
      >
        Try: <span className="term-accent3">resume</span> ·{" "}
        <span className="term-accent3">projects</span> ·{" "}
        <span className="term-accent3">skills</span> ·{" "}
        <span className="term-accent3">contact</span>
      </p>
    </div>
  );
};

export default About;
