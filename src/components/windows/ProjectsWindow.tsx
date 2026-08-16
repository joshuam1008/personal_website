import type { ProjectEntry } from '@components/commands/Projects';

type ProjectsWindowProps = {
  projects: ProjectEntry[];
};

export function ProjectsWindow({ projects }: ProjectsWindowProps) {
  return (
    <div className="info-window-body">
      <div className="info-grid">
        {projects.map((p) => (
          <div key={p.slug} className="info-card">
            <div className="info-card-title">{p.title}</div>
            <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {p.summary}
            </p>
            {p.tags && p.tags.length > 0 && (
              <div className="skills-tags">
                {p.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <a
                href={`/projects/${p.slug}`}
                className="term-link"
                style={{ marginRight: '12px', fontSize: '0.85em' }}
              >
                Case study →
              </a>
              {p.links && p.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="term-link"
                  style={{ marginRight: '12px', fontSize: '0.85em' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
