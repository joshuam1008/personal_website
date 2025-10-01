import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .map((post) => ({
      id: `post-${post.slug}`,
      title: post.data.title,
      summary: post.data.description,
      tags: post.data.tags,
      type: 'Writing',
      url: `/blog/${post.slug}/`,
      content: 'body' in post && typeof (post as any).body === 'string' ? (post as any).body : '',
    }));

  const projects = (await getCollection('projects')).map((project) => ({
    id: `project-${project.slug}`,
    title: project.data.title,
    summary: project.data.summary,
    tags: project.data.tags,
    type: 'Project',
    url: `/projects/${project.slug}/`,
    content: 'body' in project && typeof (project as any).body === 'string' ? (project as any).body : '',
  }));

  const entries = [...posts, ...projects];

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
