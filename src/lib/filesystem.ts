import { SKILLS } from "../data/skills.ts";
import { SOCIALS } from "../data/socials.ts";

// ── Types ────────────────────────────────────────────────────
export type FileSystemNode = {
  type: "dir" | "file";
  content?: string;
  children?: Record<string, FileSystemNode>;
};

// Minimal shape of portfolio data needed to build the filesystem
type ProjectData = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  links?: { label: string; href: string }[];
};

type BlogData = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  tags?: string[];
};

// ── Path utilities ────────────────────────────────────────────
export function resolvePath(target: string, currentPath: string): string {
  if (!target || target === "~") return "/home/visitor";
  if (target === "/") return "/";
  if (target.startsWith("~/")) return `/home/visitor${target.slice(1)}`;
  if (target.startsWith("/")) return target;
  const base = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  return `${base}${target}`;
}

export function normalizePath(path: string): string {
  const parts: string[] = [];
  path
    .split("/")
    .filter(Boolean)
    .forEach((part) => {
      if (part === ".") return;
      if (part === "..") {
        parts.pop();
        return;
      }
      parts.push(part);
    });
  return `/${parts.join("/")}`;
}

export function getNode(
  root: FileSystemNode,
  path: string,
): FileSystemNode | null {
  const normalized = normalizePath(path);
  const parts = normalized.split("/").filter(Boolean);
  let node = root;
  for (const part of parts) {
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

export function formatPath(path: string): string {
  if (path === "/home/visitor" || path === "/home/visitor/") return "~";
  if (path.startsWith("/home/visitor/"))
    return `~/${path.slice("/home/visitor/".length)}`;
  return path;
}

// ── Filesystem builder ────────────────────────────────────────
export function buildFilesystem(
  projects: ProjectData[],
  blog: BlogData[],
): FileSystemNode {
  const skillsContent = SKILLS.map(
    (cat) => `${cat.category}:\n  ${cat.items.join(", ")}`,
  ).join("\n\n");

  const contactContent = SOCIALS.map(
    (s) => `${s.name.padEnd(10)} ${s.label}`,
  ).join("\n");

  const aboutContent = [
    "Joshua Mason — Applied Scientist & AI Engineer",
    "Location: MSP, MN",
    "",
    "Specializing in agentic systems, search, and decision-making.",
    "Experienced in building production systems for search relevance,",
    "retrieval augmentation, and AI.",
    "",
    "Passionate about research implementation, especially around",
    "multi-agent orchestration and search infrastructure.",
  ].join("\n");

  const blogChildren: Record<string, FileSystemNode> = blog.reduce(
    (acc, post) => {
      const date = new Date(post.pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      acc[`${post.slug}.txt`] = {
        type: "file",
        content: [
          post.title,
          `Published: ${date}`,
          post.tags?.length ? `Tags: ${post.tags.join(", ")}` : "",
          "",
          post.description,
        ]
          .filter((l) => l !== undefined)
          .join("\n"),
      };
      return acc;
    },
    {} as Record<string, FileSystemNode>,
  );

  const projectChildren: Record<string, FileSystemNode> = projects.reduce(
    (acc, p) => {
      const lines = [
        p.title,
        "",
        p.summary,
        "",
        ...(p.tags?.length ? [`Stack: ${p.tags.join(", ")}`] : []),
        ...(p.links?.map((l) => `${l.label}: ${l.href}`) ?? []),
      ];
      acc[`${p.slug}.txt`] = {
        type: "file",
        content: lines.join("\n"),
      };
      return acc;
    },
    {} as Record<string, FileSystemNode>,
  );

  return {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          visitor: {
            type: "dir",
            children: {
              "README.txt": {
                type: "file",
                content:
                  "Welcome to Joshua Mason's portfolio.\nType 'help' for available commands.\nTry: ls, cat about.txt, cd /projects",
              },
              "about.txt": { type: "file", content: aboutContent },
              "skills.txt": { type: "file", content: skillsContent },
              "contact.txt": { type: "file", content: contactContent },
              ...(Object.keys(blogChildren).length > 0
                ? {
                    blog: {
                      type: "dir",
                      children: blogChildren,
                    },
                  }
                : {}),
            },
          },
        },
      },
      projects: {
        type: "dir",
        children: projectChildren,
      },
    },
  };
}
