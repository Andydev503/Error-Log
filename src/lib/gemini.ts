import { GoogleGenAI } from "@google/genai";
import { SUBJECT_MAP, DEFAULT_GEMINI_MODEL, type SubjectId } from "./constants";

const FALLBACK_MODEL = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface SolutionContext {
  subject: SubjectId;
  topic?: string | null;
  source?: string | null;
  casActive?: boolean;
}

function buildPrompt(ctx: SolutionContext): string {
  const meta = SUBJECT_MAP[ctx.subject];
  const lines = [
    `You are an expert ${meta.label} tutor for VCE (Victorian Certificate of Education) Units 3 & 4.`,
    `A student got the problem in the attached image wrong and needs a clear worked solution.`,
    ctx.topic ? `Topic: ${ctx.topic}.` : "",
    ctx.casActive === false
      ? `This is a tech-free (no calculator) question, so show full working by hand.`
      : ctx.casActive
        ? `A CAS calculator is allowed, but still explain the reasoning, not just keystrokes.`
        : "",
    "",
    "Write a step-by-step worked solution that:",
    "- Restates what the question is asking in one short line.",
    "- Works through each step with brief explanations of *why*.",
    "- Uses LaTeX for all maths: inline as $...$ and display as $$...$$.",
    "- Ends with a clearly bolded **Final answer**.",
    "- Adds a short **Watch out** note on the most common mistake for this type of question.",
    "Keep it concise and readable. Do not invent parts of the question you cannot see.",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function generateSolution(
  imageBytes: Uint8Array,
  mimeType: string,
  ctx: SolutionContext,
  model?: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const base64 = Buffer.from(imageBytes).toString("base64");

  const response = await ai.models.generateContent({
    model: model || FALLBACK_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(ctx) },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}
