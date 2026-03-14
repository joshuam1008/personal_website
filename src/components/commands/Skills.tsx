import React from 'react';
import { SKILLS } from '../../data/skills';

const Skills: React.FC = () => {
  return (
    <div data-testid="skills">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>Technologies I work with:</p>
      {SKILLS.map(({ category, items }) => (
        <div className="term-skills-row" key={category}>
          <span className="term-skills-cat">{category}</span>
          <span className="term-skills-items">{items.join('  ·  ')}</span>
        </div>
      ))}
    </div>
  );
};

export default Skills;
