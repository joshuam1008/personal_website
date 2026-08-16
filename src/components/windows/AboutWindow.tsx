import type { ResumeEntry } from '@components/commands/Resume';
import { formatDate } from '@components/commands/Resume';
import { BIO } from '../../data/bio';

type AboutWindowProps = {
  resume: ResumeEntry[];
};

export function AboutWindow({ resume }: AboutWindowProps) {
  const experience = resume.filter((e) => e.section === 'experience');
  const education = resume.filter((e) => e.section === 'education');

  return (
    <div className="info-window-body">
      <div className="info-card">
        <div className="info-hero">
          <h2>{BIO.name}</h2>
          <p>{BIO.role}</p>
        </div>
      </div>

      <div className="info-card">
        <div className="info-card-title">About</div>
        <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {BIO.summary}
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
                {formatDate(e.start)} – {e.end ? formatDate(e.end) : 'Present'}
              </div>
              {e.bullets && e.bullets.length > 0 && (
                <ul>
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
                {formatDate(e.start)} – {e.end ? formatDate(e.end) : 'Present'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
