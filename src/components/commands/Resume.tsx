import React, { useContext } from 'react';
import { termContext } from '../termContext';

export type ResumeEntry = {
  section: 'experience' | 'education' | 'highlight';
  title: string;
  organization: string;
  location?: string;
  start: string;
  end?: string;
  link?: string;
  bullets: string[];
};

interface ResumeProps {
  resume: ResumeEntry[];
}

function formatDate(iso: string): string {
  // iso is "2024-05" or "2024-08"
  const [year, month] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return month ? `${months[parseInt(month, 10) - 1]} ${year}` : year;
}

const ResumeEntry: React.FC<{ entry: ResumeEntry }> = ({ entry }) => (
  <div className="term-resume-entry">
    <div className="term-resume-title">{entry.title}</div>
    <div className="term-resume-org">
      {entry.link
        ? <a className="term-link" href={entry.link} target="_blank" rel="noreferrer">{entry.organization}</a>
        : entry.organization}
      {entry.location ? <span className="term-dim"> · {entry.location}</span> : null}
    </div>
    <div className="term-resume-meta">
      {formatDate(entry.start)} — {entry.end ? formatDate(entry.end) : 'Present'}
    </div>
    {entry.bullets.length > 0 && (
      <ul className="term-resume-bullets">
        {entry.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    )}
  </div>
);

const Resume: React.FC<ResumeProps> = ({ resume }) => {
  const { arg } = useContext(termContext);

  const filter = arg[0]?.toLowerCase();
  const experience = resume.filter((e) => e.section === 'experience');
  const education  = resume.filter((e) => e.section === 'education');
  const highlights = resume.filter((e) => e.section === 'highlight');

  // Determine what to show based on sub-command arg
  const showExp  = !filter || filter === 'experience';
  const showEdu  = !filter || filter === 'education';
  const showHlt  = !filter || filter === 'highlights';

  // Unknown sub-command
  if (filter && !['experience', 'education', 'highlights'].includes(filter)) {
    return (
      <div className="term-error">
        Unknown sub-command: <strong>{filter}</strong>
        <div className="term-dim" style={{ marginTop: '0.25rem' }}>
          Usage: <span className="term-accent3">resume</span> | <span className="term-accent3">resume experience</span> | <span className="term-accent3">resume education</span> | <span className="term-accent3">resume highlights</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="resume">
      <p className="term-dim" style={{ marginBottom: '0.25rem' }}>
        <a className="term-link" href="/Joshua-Mason-Resume.pdf" target="_blank" rel="noreferrer">
          ↓ Download PDF resume
        </a>
      </p>

      {showExp && experience.length > 0 && (
        <>
          <div className="term-section-header">Experience</div>
          {experience.map((e, i) => <ResumeEntry key={i} entry={e} />)}
        </>
      )}

      {showEdu && education.length > 0 && (
        <>
          <div className="term-section-header">Education</div>
          {education.map((e, i) => <ResumeEntry key={i} entry={e} />)}
        </>
      )}

      {showHlt && highlights.length > 0 && (
        <>
          <div className="term-section-header">Highlights</div>
          {highlights.map((e, i) => (
            <div key={i} className="term-resume-entry">
              <div className="term-resume-title">{e.title}</div>
              <div className="term-resume-org">{e.organization}</div>
              {e.bullets.map((b, j) => (
                <div key={j} className="term-dim" style={{ fontSize: '0.9em', marginTop: '0.1rem' }}>• {b}</div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Resume;
