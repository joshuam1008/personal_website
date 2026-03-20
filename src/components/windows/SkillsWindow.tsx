import { SKILLS } from '../../data/skills';
import type { SkillCategory } from '../../data/skills';

export function SkillsWindow() {
  return (
    <div className="info-window-body">
      {SKILLS.map((skill: SkillCategory) => (
        <div key={skill.category} className="info-card">
          <div className="info-card-title">{skill.category}</div>
          <div className="skills-tags">
            {skill.items.map((item: string) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
