import type { BlogEntry } from '@components/commands/Blog';

type BlogWindowProps = {
  blog: BlogEntry[];
};

export function BlogWindow({ blog }: BlogWindowProps) {
  if (blog.length === 0) {
    return (
      <div className="info-window-body">
        <div className="info-card">
          <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            No posts published yet. The first one is being written — check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-window-body">
      {blog.map((post) => {
        const pubDate = new Date(post.pubDate);
        const formatted = pubDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={post.slug} className="info-card">
            <div className="info-card-title">{post.title}</div>
            <div style={{ fontSize: '0.75em', color: 'var(--text-dim)', marginBottom: '6px' }}>
              {formatted}
              {post.readingTime ? ` • ${post.readingTime}` : ''}
            </div>
            <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {post.description}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="skills-tags">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
