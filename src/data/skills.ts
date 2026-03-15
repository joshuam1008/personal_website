export type SkillCategory = {
  category: string;
  items: string[];
};

export const SKILLS: SkillCategory[] = [
  {
    category: "Languages",
    items: [
      "Python",
      "TypeScript",
      "C++",
      "C",
      "Java",
      "SQL",
      "Mandarin Chinese",
    ],
  },
  {
    category: "ML / DL / AI",
    items: ["PyTorch", "scikit-learn", "HuggingFace", "BERT", "Transformers", "LLMs"],
  },
  {
    category: "Agentic AI",
    items: [
      "LangGraph",
      "Agentic Search",
      "ReACT / Planner Agents",
      "LLM-as-a-judge & HITL Evals",
    ],
  },
  {
    category: "Web",
    items: ["React", "Astro", "Next.js", "Node.js", "REST APIs"],
  },
  {
    category: "Tools & Cloud",
    items: [
      "Git",
      "Docker",
      "AWS",
      "GitHub Actions",
      "PostgreSQL",
      "Linux",
      "OTEL",
      "Braintrust",
      "Weights & Biases",
    ],
  },
  {
    category: "GenAI SDKs",
    items: [
      "Claude SDK",
      "OpenAI SDK",
      "Google GenAI SDK",
      "Pydantic-AI",
      "Azure OpenAI",
    ],
  },
];
