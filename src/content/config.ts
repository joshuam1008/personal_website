import { defineCollection, z } from 'astro:content';

const linkSchema = z.object({
  label: z.string(),
  // Accept absolute URLs (http/https) or internal site paths starting with '/'
  href: z
    .string()
    .refine((s) => s.startsWith('/') || /^https?:\/\//.test(s), {
      message: 'Invalid href; must be absolute URL or internal path',
    }),
});

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      readingTime: z.string().optional(),
    }),
});

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      launchedAt: z.coerce.date(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      links: z.array(linkSchema).default([]),
      sortOrder: z.number().optional(),
    }),
});

const resume = defineCollection({
  type: 'data',
  schema: z.object({
    section: z.enum(['experience', 'education', 'highlight']),
    title: z.string(),
    organization: z.string(),
    location: z.string().optional(),
    start: z.string(),
    end: z.string().optional(),
    link: z.string().url().optional(),
    bullets: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, projects, resume };
