import type { Options } from 'minisearch';

export type SearchDoc = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  type: 'Project' | 'Writing';
  url: string;
  content: string;
};

/**
 * MiniSearch configuration for client-side search
 *
 * Field boost values:
 * - title: 4x - Prioritize matches in titles
 * - tags: 2x - Give extra weight to tag matches
 * - summary, content: 1x (default) - Standard matching
 *
 * fuzzy: 0.2 - Allows ~20% character differences for typo tolerance
 * prefix: true - Enables "as you type" search
 */
export const SEARCH_CONFIG: Options<SearchDoc> = {
  fields: ['title', 'summary', 'content', 'tags'],
  storeFields: ['title', 'summary', 'tags', 'type', 'url'],
  searchOptions: {
    boost: { title: 4, tags: 2 },
    fuzzy: 0.2,
    prefix: true,
  },
};
