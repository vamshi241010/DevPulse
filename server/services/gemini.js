import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gen AI client
const geminiApiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({
  apiKey: geminiApiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const MODEL_NAME = "gemini-2.5-flash";

// Check if Gemini API Key is available
export function checkGeminiApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is missing.");
    return false;
  }
  return true;
}

/**
 * Scan multiple repository files using Gemini AI.
 * Returns a health score and a list of structural code issues.
 */
export async function scanRepositoryFiles(files) {
  if (!checkGeminiApiKey()) {
    // Return sample static scan if API key is missing to avoid crashing the demo experience
    return getMockScanResult(files);
  }

  // Format files list for prompt
  // const formattedFiles = files
  //   .map((f) => `--- File: ${f.path} ---\n${f.content}`)
  //   .join("\n\n");

  // const prompt = `You are a senior code reviewer. Review the following code files and return a JSON response with this exact structure: { score: number (0-100), issues: [{ file: string, line: number, severity: 'error'|'warning'|'info', message: string }] }. Be specific about line numbers. Here are the files: \n\n${formattedFiles}`;
  const formattedFiles = files
    .map((f) => `--- File: ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const prompt = `You are an expert code security and quality engineer with 10+ years of experience.

Analyze the following code files DEEPLY and identify:
1. Security vulnerabilities (SQL injection, XSS, exposed secrets, weak auth)
2. Performance issues (memory leaks, inefficient loops, blocking calls)
3. Bad practices (no error handling, hardcoded values, unused variables)
4. Type safety issues (any types, missing null checks, undefined access)

For each issue:
- Give the EXACT line number
- Explain WHY it is dangerous or bad,the explanation should be clear and not too lengthy
- Suggest the EXACT fix

Be strict. Real production code must be production-ready.
Score the code based on actual issues found:
- No issues found: 90-100
- Only info/minor issues: 75-89
- 1-2 warnings: 60-74
- 3+ warnings or any error-level issue: below 60

Be honest and consistent — do not inflate or deflate the score artificially.

Here are the files to review:

${formattedFiles}`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Code quality score from 0 (terrible) to 100 (perfect). Make it realistic.",
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  file: { type: Type.STRING },
                  line: { type: Type.NUMBER },
                  severity: { type: Type.STRING, description: "Must be 'error', 'warning', or 'info'" },
                  message: { type: Type.STRING, description: "Detailed explanation of the issue." },
                },
                required: ["file", "line", "severity", "message"],
              },
            },
          },
          required: ["score", "issues"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error calling Gemini API for Scan Repository:", error);
    // Graceful fallback to rich mock data if Gemini API has transient issues or key is invalid
    return getMockScanResult(files);
  }
}

/**
 * Analyze a push/changed lines event.
 */
export async function analyzeWatchLines(changedLines) {
  if (!checkGeminiApiKey()) {
    return { issues: [] };
  }

  const parsedDiff = parseDiffWithLineNumbers(changedLines);
  //const prompt = `You are a senior code reviewer. The following lines were just changed in a GitHub push. Review only these changed lines and return JSON: { issues: [{ file: string, line: number, severity: 'error'|'warning'|'info', message: string }] }. If no issues found return { issues: [] }. Changed lines:\n\n${changedLines}`;
  const prompt = `You are a senior code reviewer. The following is a standard unified git diff (gitDiff format) representing code changes from a GitHub push. Review only the added or modified lines in this diff (lines starting with '+') for security vulnerabilities, bugs, or quality issues, and return JSON matching this exact structure: { issues: [{ file: string, line: number, severity: 'error'|'warning'|'info', message: string }] }. If no issues are found, return { issues: [] }. Make sure the "file" property matches the path of the modified file from the diff headers.

Changes with line numbers:
${parsedDiff}`;


  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  file: { type: Type.STRING },
                  line: { type: Type.NUMBER },
                  severity: { type: Type.STRING },
                  message: { type: Type.STRING },
                },
                required: ["file", "line", "severity", "message"],
              },
            },
          },
          required: ["issues"],
        },
      },
    });

    const text = response.text;
    if (!text) return { issues: [] };
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error calling Gemini API for Watch Lines:", error);
    return { issues: [] };
  }
}


function parseDiffWithLineNumbers(diffText) {
  const lines = diffText.split("\n");
  let currentFile = "unknown";
  let currentLineNum = 0;
  const output = [];

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.replace("+++ b/", "").trim();
      continue;
    }
    if (line.startsWith("@@")) {
      // Example: @@ -10,6 +10,8 @@
      const match = line.match(/\+(\d+)/);
      if (match) currentLineNum = parseInt(match[1], 10);
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("+++")) {
      output.push(`[File: ${currentFile}] [Line: ${currentLineNum}] ${line.slice(1)}`);
      currentLineNum++;
    } else if (!line.startsWith("-")) {
      currentLineNum++;
    }
  }

  return output.join("\n");
}

/**
 * Error Detective helper.
 */
export async function detectErrorRootCause(codeAndError,repoContext="") {
  if (!checkGeminiApiKey()) {
    return getMockErrorDetectiveResult(codeAndError);
  }

  //let prompt = `You are a senior debugging engineer. Given this error or broken code, identify the root cause and provide a fix. Return JSON: { rootCause: string, file: string, line: number, oldCode: string, fixedCode: string, explanation: string }. Error/code:\n\n${codeAndError}`;

  //  let prompt = `You are a senior debugging engineer. Given this error or broken code, identify the root cause and provide a fix. Return JSON: { rootCause: string, file: string, line: number, oldCode: string, fixedCode: string, explanation: string }. Error/code:
let prompt = `You are a senior debugging engineer reviewing real production code.

STRICT RULES:
1. Only flag something as "error" if the code will actually CRASH, THROW, or PRODUCE WRONG OUTPUT.
2. Only flag something as "warning" if it's a real bug risk (e.g. unhandled null, missing await, memory leak) — NOT a style preference.
3. Do NOT flag normal working code as an error just because it could be "improved" or made "more modern." That is NOT your job here.
4. If the code has no actual error, you MUST return rootCause as "No error found — this code works correctly" and severity as "none".
5. Never suggest stylistic rewrites (template literals, formatting, naming conventions) unless the user specifically asks for code improvement, not error detection.

Analyze the following code or error message. Determine if there is an ACTUAL functional error.

Return JSON only, no markdown, no explanation outside JSON:

{
  "hasError": true or false,
  "severity": "error" | "warning" | "none",
  "file": "filename if known, else null",
  "line": line number if known else null,
  "rootCause": "plain explanation of the actual problem, or 'No error found' if none",
  "oldCode": "the problematic code, or null if no error",
  "fixedCode": "the corrected code, or null if no error",
  "explanation": "why this fix is needed, or 'Code is functioning correctly' if no error"
}

Code or error to analyze:
${codeAndError}`;


  if (repoContext) {
    prompt += `\n\nWe have fetched context files from the selected repository to assist your debugging. Use this repository structure and contents to trace definitions, understand symbols, locate where the issue lies, and ensure your proposed correction aligns perfectly with the codebase:\n\n${repoContext}`;
  }
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasError: {type: Type.BOOLEAN},
            severity: { type: Type.STRING, description: "Must be 'error', 'warning', or 'none'" },
            rootCause: { type: Type.STRING },
            file: { type: Type.STRING,nullable:true },
            line: { type: Type.NUMBER,nullable:true },
            oldCode: { type: Type.STRING, nullable:true },
            fixedCode: { type: Type.STRING, nullable:true },
            explanation: { type: Type.STRING },
          },
          required: ["hasError","hasError"==true?("oldCode","file","line","fixedCode","severity", "rootCause", "explanation"):"severity", "rootCause", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text.trim());
    return result;
  } catch (error) {
    console.error("Error calling Gemini API for Error Detective:", error);
    return getMockErrorDetectiveResult(codeAndError);
  }
}


// ==========================================
// MOCK DATA BACKUPS (FOR GRACEFUL FALLBACK)
// ==========================================
function getMockScanResult(files) {
  const issues = [];
  let score = 85;

  if (files.length === 0) {
    return { score: 100, issues: [] };
  }

  // Generate realistic code issues based on the mock files provided
  files.forEach((f) => {
    if (f.content.includes("process.env") && !f.content.includes("if (!")) {
      issues.push({
        file: f.path,
        line: f.content.split("\n").findIndex((l) => l.includes("process.env")) + 1 || 4,
        severity: "warning",
        message: "Missing validation for process.env variable. It could be undefined at runtime.",
      });
      score -= 5;
    }
    if (f.content.includes("== ")) {
      issues.push({
        file: f.path,
        line: f.content.split("\n").findIndex((l) => l.includes("== ")) + 1 || 12,
        severity: "info",
        message: "Consider using triple equals (===) for strict equality checking.",
      });
      score -= 2;
    }
    if (f.content.includes("any") && !f.content.includes("many")) {
      issues.push({
        file: f.path,
        line: f.content.split("\n").findIndex((l) => l.includes("any")) + 1 || 8,
        severity: "warning",
        message: "Avoid using the 'any' type in TypeScript; define strict interfaces or types instead.",
      });
      score -= 4;
    }
  });

  if (issues.length === 0) {
    // Insert a generic issue to make dashboard interesting
    issues.push({
      file: files[0].path,
      line: 3,
      severity: "info",
      message: "Minor optimization: ensure all dependencies are explicitly imported at the top-level.",
    });
    score = 94;
  }

  return {
    score: Math.max(score, 30),
    issues,
  };
}

// function getMockErrorDetectiveResult(input) {
//   return {
//     rootCause: "A standard ReferenceError or TypeMismatch was detected in the submitted snippet.",
//     file: "src/utils/calculator.ts",
//     line: 14,
//     oldCode: `function calculateTotal(items) {\n  return items.reduce((acc, curr) => acc + curr.val);\n}`,
//     fixedCode: `function calculateTotal(items: Array<{ val: number }>) {\n  if (!items || items.length === 0) return 0;\n  return items.reduce((acc, curr) => acc + (curr?.val || 0), 0);\n}`,
//     explanation: "The original reducer function fails when 'items' is undefined/empty, or if 'acc' is initialized without a starting value of 0, throwing a TypeError. Adding type safety and defensive checks prevents this crash.",
//   };
// }

function getMockErrorDetectiveResult(input) {
  return {
    hasError: true,
    severity: "error",
    rootCause: "A standard ReferenceError or TypeMismatch was detected in the submitted snippet.",
    file: "src/utils/calculator.ts",
    line: 14,
    oldCode: `function calculateTotal(items) {\n  return items.reduce((acc, curr) => acc + curr.val);\n}`,
    fixedCode: `function calculateTotal(items) {\n  if (!items || items.length === 0) return 0;\n  return items.reduce((acc, curr) => acc + (curr?.val || 0), 0);\n}`,
    explanation: "The original reducer function fails when 'items' is undefined/empty, or if 'acc' is initialized without a starting value of 0, throwing a TypeError. Adding type safety and defensive checks prevents this crash.",
  };
}