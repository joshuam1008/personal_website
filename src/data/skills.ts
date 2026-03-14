export type SkillCategory = {
  category: string;
  items: string[];
};

export const SKILLS: SkillCategory[] = [
  {
    category: 'Languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'SQL', 'Mandarin Chinese'],
  },
  {
    category: 'ML / AI',
    items: ['PyTorch', 'scikit-learn', 'LangChain', 'AWS Bedrock', 'OpenCV', 'RAG pipelines', 'NLP / text classification'],
  },
  {
    category: 'Web',
    items: ['React', 'Astro', 'Next.js', 'Node.js', 'REST APIs'],
  },
  {
    category: 'Tools & Cloud',
    items: ['Git', 'Docker', 'AWS', 'GitHub Actions', 'PostgreSQL', 'Linux'],
  },
];
