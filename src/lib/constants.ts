// Domain constants for the error log (VCE Methods / Specialist / Physics).

export type SubjectId = "methods" | "specialist" | "physics";

export interface SubjectMeta {
  id: SubjectId;
  label: string;
  short: string;
  /** Tailwind-friendly accent token used across the UI (see globals.css). */
  accent: string;
  /** Whether CAS-active vs tech-free is a meaningful distinction for this subject. */
  usesCas: boolean;
  topics: string[];
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: "methods",
    label: "Mathematical Methods",
    short: "Methods",
    accent: "blue",
    usesCas: true,
    topics: [
      "Functions & relations",
      "Polynomials",
      "Transformations",
      "Inverse functions",
      "Composite functions",
      "Exponential & logarithmic",
      "Circular (trig) functions",
      "Find unknown constant",
      "Differentiation",
      "Applications of differentiation",
      "Anti-differentiation",
      "Integration & area",
      "Discrete random variables",
      "Binomial distribution",
      "Continuous random variables",
      "Normal distribution",
      "Sample proportions & CIs",
      "Other",
    ],
  },
  {
    id: "specialist",
    label: "Specialist Mathematics",
    short: "Spesh",
    accent: "violet",
    usesCas: true,
    topics: [
      "Complex numbers",
      "Vectors",
      "Vector calculus",
      "Rational functions",
      "Circular functions",
      "Proof & logic",
      "Differentiation",
      "Integration techniques",
      "Differential equations",
      "Kinematics",
      "Mechanics (dynamics)",
      "Statistical inference",
      "Hypothesis testing",
      "Other",
    ],
  },
  {
    id: "physics",
    label: "Physics",
    short: "Physics",
    accent: "emerald",
    usesCas: false,
    topics: [
      "Kinematics",
      "Forces & Newton's laws",
      "Momentum & impulse",
      "Energy & work",
      "Circular motion & gravitation",
      "Electric fields & circuits",
      "Magnetism & EM induction",
      "Waves",
      "Light & optics",
      "Sound",
      "Nuclear & radioactivity",
      "Photoelectric effect & quanta",
      "Special relativity",
      "Fields (gravitational/electric/magnetic)",
      "Other",
    ],
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectMeta> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, SubjectMeta>;

export function isSubjectId(value: string): value is SubjectId {
  return value === "methods" || value === "specialist" || value === "physics";
}

export type ProblemStatus = "todo" | "learning" | "mastered";

export const STATUSES: { id: ProblemStatus; label: string }[] = [
  { id: "todo", label: "To review" },
  { id: "learning", label: "Learning" },
  { id: "mastered", label: "Mastered" },
];

export const STATUS_MAP: Record<ProblemStatus, string> = {
  todo: "To review",
  learning: "Learning",
  mastered: "Mastered",
};

/** Supabase Storage bucket that holds problem & answer screenshots. */
export const IMAGE_BUCKET = "problem-images";

/** Gemini models selectable for AI solutions (vision-capable, free tier). */
export const GEMINI_MODELS = [
  { id: "gemini-3.5-flash", label: "3.5 Flash", hint: "Newest · recommended" },
  { id: "gemini-3.1-pro-preview", label: "3.1 Pro", hint: "Best reasoning · slower" },
  { id: "gemini-3.1-flash-lite", label: "3.1 Flash-Lite", hint: "Fastest" },
  { id: "gemini-3-flash-preview", label: "3 Flash", hint: "Fast" },
  { id: "gemini-2.5-flash", label: "2.5 Flash", hint: "Stable" },
  { id: "gemini-2.5-pro", label: "2.5 Pro", hint: "Stable · strong" },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["id"];

export const GEMINI_MODEL_IDS = GEMINI_MODELS.map((m) => m.id) as string[];

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-3.5-flash";

export function isGeminiModel(value: string): value is GeminiModelId {
  return GEMINI_MODEL_IDS.includes(value);
}
