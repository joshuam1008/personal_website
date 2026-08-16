import React from "react";
import { BIO } from "../../data/bio";

const About: React.FC = () => {
  return (
    <div data-testid="about">
      <p>
        Hi, I'm <span className="term-accent">{BIO.name}</span> — {BIO.role} based in the US.
      </p>
      <p style={{ marginTop: "0.5rem" }}>{BIO.summary}</p>
      <p style={{ marginTop: "0.5rem" }}>{BIO.education}.</p>

      <p
        className="term-body"
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
