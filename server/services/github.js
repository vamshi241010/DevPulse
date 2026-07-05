// Native fetch is available globally in Node.js 18+

// Mock repositories used for demonstration/sandbox mode
const MOCK_REPOS = [
  {
    id: 101,
    name: "auth-service",
    fullName: "demo-user/auth-service",
    description: "JWT and Session authentication microservice in Node.js and Express.",
    ownerAvatar: "https://avatars.githubusercontent.com/u/9919?v=4",
    stars: 142,
    language: "TypeScript",
  },
  {
    id: 102,
    name: "dashboard-app",
    fullName: "demo-user/dashboard-app",
    description: "React client featuring a fully responsive admin layout with charts.",
    ownerAvatar: "https://avatars.githubusercontent.com/u/9919?v=4",
    stars: 88,
    language: "JavaScript",
  },
  {
    id: 103,
    name: "utils-library",
    fullName: "demo-user/utils-library",
    description: "Helper functions and calculations with complex array reductions.",
    ownerAvatar: "https://avatars.githubusercontent.com/u/9919?v=4",
    stars: 34,
    language: "TypeScript",
  },
];

// Rich mock files to simulate code scans
const MOCK_FILES = {
  "demo-user/auth-service": [
    {
      path: "src/middleware/auth.ts",
      content: `import { Request, Response, NextFunction } from "express";\n\nexport function verifyToken(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers["authorization"];\n  // Insecure: no error handling if header is missing\n  const bearer = token.split(" ")[1]; \n  \n  if (bearer == "admin-secret") {\n    // Warning: weak admin bypass \n    return next();\n  }\n  \n  next();\n}`,
    },
    {
      path: "src/server.ts",
      content: `import express from "express";\nconst app = express();\n\n// Error: Hardcoded secrets exposed\nconst PORT = process.env.PORT || 3000;\nconst DB_PASSWORD = "super_secret_password_123";\n\napp.listen(PORT, () => {\n  console.log("Server listening on port " + PORT);\n});`,
    },
  ],
  "demo-user/dashboard-app": [
    {
      path: "src/components/Chart.jsx",
      content: `import React, { useEffect } from "react";\n\nexport default function Chart({ data }) {\n  useEffect(() => {\n    // Info: empty dependency array should be stabilized\n    console.log("Chart rendered with data", data);\n  });\n\n  return (\n    <div className="chart-wrapper">\n      <h3>Analytics</h3>\n      {data.map(item => (\n        <div key={item.id}>{item.name}: {item.value}</div>\n      ))}\n    </div>\n  );\n}`,
    },
  ],
  "demo-user/utils-library": [
    {
      path: "src/math.ts",
      content: `export function divide(a: number, b: number): number {\n  // Error: Division by zero is not handled\n  return a / b;\n}\n\nexport function deepClone(obj: any): any {\n  // Warning: heavy operation, could be optimized\n  return JSON.parse(JSON.stringify(obj));\n}`,
    },
  ],
};
async function checkRateLimit(token) {
  console.log("Inside me");
  
  const res = await fetch("https://api.github.com/rate_limit", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await res.json();

  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: data.rate.reset,
  };
}
/**
 * Fetch repositories of the authenticated user.
 * Falls back to beautiful mock data if no token or API fails.
 */
export async function getUserRepositories(token) {
  const limitInfo = await checkRateLimit(token);

  console.log("GitHub Limit Remaining:", limitInfo.remaining);

  if (limitInfo.remaining === 0) {
    throw new Error("GitHub API limit reached. Please wait.");
  }

  if (!token || token.startsWith("mock_")) {
    return MOCK_REPOS;
  }
  try {

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "No description provided.",
      ownerAvatar: repo.owner?.avatar_url || "https://avatars.githubusercontent.com/u/9919?v=4",
      stars: repo.stargazers_count || 0,
      language: repo.language || "TypeScript",
    }));
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return MOCK_REPOS;
  }
}

/**
 * Fetch code files of a repository for scanning.
 * Grabs files recursively from the GitHub repo tree, or uses rich fallback mocks if sandbox.
 */
export async function getRepositoryFiles(repoFullName, token) {
  const limitInfo = await checkRateLimit(token);

  console.log("Remaining:", limitInfo.remaining);

  if (limitInfo.remaining === 0) {
    return MOCK_FILES[repoFullName] || MOCK_FILES["demo-user/auth-service"];
  }

  // Use mock files for mock repositories or if sandbox mode active
  if (!token || token.startsWith("mock_") || MOCK_FILES[repoFullName]) {
    return MOCK_FILES[repoFullName] || MOCK_FILES["demo-user/auth-service"];
  }
  try {
    // 1. Get default branch (typically main or master)
    const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    if (!repoRes.ok) {
      throw new Error(`Failed to get repo info: ${repoRes.statusText}`);
    }

    const repoInfo = await repoRes.json();
    const defaultBranch = repoInfo.default_branch || "main";

    // 2. Get recursive tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "DevPulse-Code-Reviewer",
        },
      }
    );

    if (!treeRes.ok) {
      throw new Error(`Failed to get repo file tree: ${treeRes.statusText}`);
    }

    const treeData = await treeRes.json();
    const items = treeData.tree || [];

    // Filter list to keep only code files: .ts, .tsx, .js, .jsx, .json
    // Avoid node_modules, dist, config, images, lockfiles
    const allowedExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
    const codeFileEntries = items.filter((item) => {
      if (item.type !== "blob") return false;
      const lowercasePath = item.path.toLowerCase();
      if (
        lowercasePath.includes("node_modules/") ||
        lowercasePath.includes("dist/") ||
        lowercasePath.includes("package-lock.json") ||
        lowercasePath.includes(".gitignore")
      ) {
        return false;
      }
      return allowedExtensions.some((ext) => lowercasePath.endsWith(ext));
    });

    // Take top 5 files to stay within Gemini rates and context limits
    const chosenEntries = codeFileEntries.slice(0, 5);

    // Fetch contents for each chosen file
    const fetchedFiles = [];
    for (const entry of chosenEntries) {
      try {
        const fileContentRes = await fetch(entry.url, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3.raw",
            "User-Agent": "DevPulse-Code-Reviewer",
          },
        });

        if (fileContentRes.ok) {
          const text = await fileContentRes.text();
          // Keep content below 20KB per file
          const content = text.slice(0, 20000);
          fetchedFiles.push({
            path: entry.path,
            content,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch file ${entry.path}:`, err);
      }
    }

    if (fetchedFiles.length === 0) {
      return MOCK_FILES["demo-user/auth-service"];
    }

    return fetchedFiles;
  } catch (error) {
    console.error("Error loading GitHub repository files:", error);
    return MOCK_FILES[repoFullName] || MOCK_FILES["demo-user/auth-service"];
  }
}

/**
 * Register a push webhook with GitHub.
 */
export async function registerWebhook(repoFullName, token, webhookUrl) {
  if (!token || token.startsWith("mock_")) {
    return "mock_webhook_id_" + Math.random().toString(36).substring(2, 9);
  }

  try {
    // STEP 1: Check for and delete any existing DevPulse webhooks first
    const existingHooksRes = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    if (existingHooksRes.ok) {
      const existingHooks = await existingHooksRes.json();
      for (const hook of existingHooks) {
        if (hook.config?.url?.includes("/api/webhook")) {
          console.log(`Deleting stale webhook ${hook.id} (old URL: ${hook.config.url})`);
          await fetch(`https://api.github.com/repos/${repoFullName}/hooks/${hook.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "DevPulse-Code-Reviewer",
            },
          });
        }
      }
    }
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
      body: JSON.stringify({
        name: "web",

        active: true,
        events: ["push"],
        config: {
          url: webhookUrl,
          content_type: "json",
          insecure_ssl: "0",
        },
      }),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("GitHub Response:");
    console.log(JSON.stringify(data, null, 2));
    if (!response.ok) {
      throw new Error(data.message || `Failed to create webhook: ${response.statusText}`);
    }

    return String(data.id);
  } catch (error) {
    console.error("Webhook registration failed:", error);
    // Return a dummy webhook ID for fallback
    return "mock_webhook_id_" + Math.random().toString(36).substring(2, 9);
  }
}

/**
 * Unregister a push webhook from GitHub.
 */
export async function unregisterWebhook(repoFullName, token, webhookId) {
  if (!token || token.startsWith("mock_") || webhookId.startsWith("mock_")) {
    return true;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/hooks/${webhookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    return response.status === 204;
  } catch (error) {
    console.error("Webhook unregistration failed:", error);
    return false;
  }
}



/**
 * Fetch a unified diff for a single commit from GitHub.
 */
export async function getCommitDiff(repoFullName, commitSha, token) {
  if (!token || token.startsWith("mock_") || !commitSha) {
    return `diff --git a/src/index.ts b/src/index.ts
index d3b0738..f2c8d23 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -8,8 +8,11 @@
 export function calculateInterest(p, r, t) {
-  return p * r * t;
+  if (p < 0 || r < 0 || t < 0) {
+    throw new Error("Parameters must be non-negative");
+  }
+  return p * r * t;
 }`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/commits/${commitSha}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.diff",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commit diff: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching gitDiff from GitHub:", error);
    return `diff --git a/src/index.ts b/src/index.ts
index d3b0738..f2c8d23 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -8,8 +8,11 @@
 export function calculateInterest(p, r, t) {
-  return p * r * t;
+  if (p < 0 || r < 0 || t < 0) {
+    throw new Error("Parameters must be non-negative");
+  }
+  return p * r * t;
 }`;
  }
}

/**
 * Fetch a unified diff for a comparison between two commits/refs from GitHub.
 */
export async function getCompareDiff(repoFullName, base, head, token) {
   if (base === "0000000000000000000000000000000000000000") {
    return getCommitDiff(repoFullName, head, token);
  }
  if (!token || token.startsWith("mock_") || !base || !head) {
    return `diff --git a/src/index.ts b/src/index.ts
index d3b0738..f2c8d23 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -8,8 +8,11 @@
 export function calculateInterest(p, r, t) {
-  return p * r * t;
+  if (p < 0 || r < 0 || t < 0) {
+    throw new Error("Parameters must be non-negative");
+  }
+  return p * r * t;
 }`;
   }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/compare/${base}...${head}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.diff",
        "User-Agent": "DevPulse-Code-Reviewer",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch compare diff: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching compare gitDiff from GitHub:", error);
    return `diff --git b/src/index.ts b/src/index.ts
index d3b0738..f2c8d23 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -8,8 +8,11 @@
 export function calculateInterest(p, r, t) {
-  return p * r * t;
+  if (p < 0 || r < 0 || t < 0) {
+    throw new Error("Parameters must be non-negative");
+  }
+  return p * r * t;
 }`;
  }
}
