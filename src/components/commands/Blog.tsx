import React, { useContext, useEffect } from 'react';
import { termContext } from '../termContext';

export type BlogEntry = {
  slug: string;
  title: string;
  description: string;
  pubDate: string; // ISO date string
  tags: string[];
  readingTime?: string;
};

interface BlogProps {
  blog: BlogEntry[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const Blog: React.FC<BlogProps> = ({ blog }) => {
  const { arg, rerender } = useContext(termContext);

  const subCmd = arg[0]?.toLowerCase();
  const slugArg = arg[1];

  // "blog read <slug>" — open post in new tab
  useEffect(() => {
    if (rerender && subCmd === 'read' && slugArg) {
      window.open(`/blog/${slugArg}/`, '_blank', 'noopener,noreferrer');
    }
  }, [rerender]);

  if (subCmd && !['list', 'read'].includes(subCmd)) {
    return (
      <div className="term-error">
        Unknown sub-command: <strong>{subCmd}</strong>
        <div className="term-dim" style={{ marginTop: '0.25rem' }}>
          Usage: <span className="term-accent3">blog</span> | <span className="term-accent3">blog list</span> | <span className="term-accent3">blog read &lt;slug&gt;</span>
        </div>
      </div>
    );
  }

  if (subCmd === 'read') {
    if (!slugArg) {
      return (
        <div className="term-error">
          Please provide a post slug.
          <div className="term-dim">Usage: <span className="term-accent3">blog read &lt;slug&gt;</span></div>
          <div className="term-dim" style={{ marginTop: '0.25rem' }}>Available slugs:</div>
          {blog.map((p) => (
            <div key={p.slug} className="term-dim" style={{ paddingLeft: '1rem' }}>• {p.slug}</div>
          ))}
        </div>
      );
    }
    const post = blog.find((p) => p.slug === slugArg);
    if (!post) {
      return (
        <div className="term-error">
          Post not found: <strong>{slugArg}</strong>
          <div className="term-dim">Available slugs:</div>
          {blog.map((p) => (
            <div key={p.slug} className="term-dim" style={{ paddingLeft: '1rem' }}>• {p.slug}</div>
          ))}
        </div>
      );
    }
    return <div className="term-dim">Opening <span className="term-accent2">{post.title}</span>...</div>;
  }

  // Default: list all posts
  return (
    <div data-testid="blog">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>
        {blog.length} post{blog.length !== 1 ? 's' : ''}. Use <span className="term-accent3">blog read &lt;slug&gt;</span> to open one.
      </p>
      {blog.map((p) => (
        <div className="term-list-item" key={p.slug}>
          <span className="term-list-num">→</span>
          <div className="term-list-body">
            <div className="term-list-title">{p.title}</div>
            <div className="term-list-desc">{p.description}</div>
            <div className="term-list-tags">
              <span className="term-dim">{formatDate(p.pubDate)}</span>
              {p.readingTime && <span className="term-dim"> · {p.readingTime}</span>}
              {p.tags.map((t) => <span key={t} className="term-dim" style={{ marginLeft: '0.5rem' }}>#{t}</span>)}
            </div>
            <div style={{ marginTop: '0.1rem' }}>
              <span className="term-dim">slug: </span>
              <span className="term-accent3">{p.slug}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blog;
