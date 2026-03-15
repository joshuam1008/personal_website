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
    items: [
      "PyTorch",
      "scikit-learn",
      "HuggingFace",
      "BERT",
      "Transformers",
      "LLMs",
    ],
  },
  {
    category: "Agent SDKs",
    items: [
      "LangGraph",
      "Claude Agent SDK",
      "OpenAI Agents SDK",
      "Google ADK",
      "Pydantic-AI",
    ],
  },
  {
    category: "Agentic AI",
    items: [
      "Agentic Search",
      "ReACT / Planner Agents",
      "LLM-as-a-judge & HITL Evals",
      "Self-learning Autoevals",
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
];
