import type { ResumeEntry } from '@components/commands/Resume';

type AboutWindowProps = {
  resume: ResumeEntry[];
};

const aboutText = `Applied Scientist & AI Engineer specializing in agentic systems, search, and decision-making.
Experienced in building production systems for search relevance, retrieval augmentation, and AI.
Passionate about research implementation, especially around multi-agent orchestration and search infrastructure.`;

export function AboutWindow({ resume }: AboutWindowProps) {
  const experience = resume.filter((e) => e.section === 'experience');
  const education = resume.filter((e) => e.section === 'education');

  return (
    <div className="info-window-body">
      <div className="info-card">
        <div className="info-hero">
          <h2>Joshua Mason</h2>
          <p>Applied Scientist & AI Engineer</p>
        </div>
      </div>

      <div className="info-card">
        <div className="info-card-title">About</div>
        <p style={{ fontSize: '0.9em', color: 'var(--text-dim)', lineHeight: '1.5' }}>
          {aboutText}
        </p>
      </div>

      {experience.length > 0 && (
        <div className="info-card">
          <div className="info-card-title">Experience</div>
          {experience.map((e) => (
            <div key={e.title} className="experience-row">
              <div className="exp-title">{e.title}</div>
              <div className="exp-org">{e.organization}</div>
              <div className="exp-date">
                {e.start} – {e.end}
              </div>
              {e.bullets && e.bullets.length > 0 && (
                <ul className="experience-row">
                  {e.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="info-card">
          <div className="info-card-title">Education</div>
          {education.map((e) => (
            <div key={e.title} className="experience-row">
              <div className="exp-title">{e.title}</div>
              <div className="exp-org">{e.organization}</div>
              <div className="exp-date">
                {e.start} – {e.end}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
