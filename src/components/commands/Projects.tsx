import React, { useContext, useEffect } from 'react';
import { termContext } from '../termContext';

export type ProjectEntry = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  links: Array<{ label: string; href: string }>;
  launchedAt: string; // ISO date string
};

interface ProjectsProps {
  projects: ProjectEntry[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const { arg, rerender } = useContext(termContext);

  const subCmd = arg[0]?.toLowerCase();
  const targetNum = parseInt(arg[1] ?? '', 10);

  // Handle "projects go <n>" — open URL on submit
  useEffect(() => {
    if (rerender && subCmd === 'go' && !isNaN(targetNum)) {
      const project = projects[targetNum - 1];
      if (project) {
        // Prefer the first external link; fall back to the slug-based path
        const url = project.links.find((l) => l.href.startsWith('http'))?.href
          ?? `/projects/${project.slug}/`;
        window.open(url, '_blank');
      }
    }
  }, [rerender]);

  // Invalid sub-command
  if (subCmd && subCmd !== 'go' && subCmd !== 'list') {
    return (
      <div className="term-error">
        Unknown sub-command: <strong>{subCmd}</strong>
        <div className="term-dim" style={{ marginTop: '0.25rem' }}>
          Usage: <span className="term-accent3">projects</span> | <span className="term-accent3">projects list</span> | <span className="term-accent3">projects go &lt;n&gt;</span>
        </div>
      </div>
    );
  }

  // "projects go <n>" with invalid n
  if (subCmd === 'go') {
    if (isNaN(targetNum) || targetNum < 1 || targetNum > projects.length) {
      return (
        <div className="term-error">
          Invalid project number. Use a number from 1 to {projects.length}.
          <div className="term-dim">Usage: <span className="term-accent3">projects go &lt;n&gt;</span></div>
        </div>
      );
    }
    // Valid "go" — opening handled by useEffect above, show brief feedback
    const p = projects[targetNum - 1];
    return <div className="term-dim">Opening <span className="term-accent2">{p.title}</span>...</div>;
  }

  // Default: list all projects
  return (
    <div data-testid="projects">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>
        {projects.length} project{projects.length !== 1 ? 's' : ''}. Use <span className="term-accent3">projects go &lt;n&gt;</span> to open one.
      </p>
      {projects.map((p, i) => (
        <div className="term-list-item" key={p.slug}>
          <span className="term-list-num">{i + 1}.</span>
          <div className="term-list-body">
            <div className="term-list-title">{p.title}</div>
            <div className="term-list-desc">{p.summary}</div>
            <div className="term-list-tags">
              {p.tags.map((t) => <span key={t} style={{ marginRight: '0.5rem' }}>#{t}</span>)}
            </div>
            <div style={{ marginTop: '0.15rem' }}>
              {p.links.map((l) => (
                <a key={l.label} className="term-link" href={l.href} target="_blank" rel="noreferrer" style={{ marginRight: '1rem' }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Projects;
