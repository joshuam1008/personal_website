import type { CollectionEntry } from 'astro:content';

/**
 * Sorts projects by sortOrder (if present), then by launchedAt date.
 * Projects with sortOrder always come first, sorted by their order value.
 * Projects without sortOrder are sorted by launch date (newest first).
 */
export function sortProjects(
  projects: CollectionEntry<'projects'>[],
): CollectionEntry<'projects'>[] {
  return [...projects].sort((a, b) => {
    if (a.data.sortOrder && b.data.sortOrder) {
      return a.data.sortOrder - b.data.sortOrder;
    }
    if (a.data.sortOrder) return -1;
    if (b.data.sortOrder) return 1;
    return b.data.launchedAt.getTime() - a.data.launchedAt.getTime();
  });
}
