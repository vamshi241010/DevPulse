import { Router } from "express";
import { User } from "../models/User.js";
import { GithubRepo } from "../models/GithubRepo.js";
import { ScanResult } from "../models/ScanResult.js";
import { WatchEvent } from "../models/WatchEvent.js";
import { scanRepositoryFiles, analyzeWatchLines, detectErrorRootCause } from "../services/gemini.js";
import { getUserRepositories, getRepositoryFiles, registerWebhook, unregisterWebhook, getCommitDiff, getCompareDiff} from "../services/github.js";

const router = Router();

// In-memory array of SSE client response streams
export const sseClients = [];

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please login." });
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Get logged-in user's repos
router.get("/api/repos", ensureAuthenticated, async (req, res) => {
  console.log("USER",req.user);
  
  try {
    const token = req.user.accessToken;
  console.log("TOKEN:", token);
    const repos = await getUserRepositories(token);
    console.log("REPOS:",repos);
    res.json(repos);
    // Check which repos are currently being watched by this user
    // const dbWatchedRepos = await GithubRepo.find({ userId: req.user._id || req.user.id });
    // const watchedNames = new Set(dbWatchedRepos.map((r) => r.fullName));

    // const enrichedRepos = repos.map((repo) => ({
    //   ...repo,
    //   isWatching: watchedNames.has(repo.fullName),
    // }));

    // res.json(enrichedRepos);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch repositories" });
  }
});

// 2. Scan repo files and calculate health score
router.post("/api/scan", ensureAuthenticated, async (req, res) => {
  const { repoFullName, token: bodyToken } = req.body;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName parameter" });
  }

  try {
    const token = bodyToken || req.user.accessToken || "mock_token";
    const files = await getRepositoryFiles(repoFullName, token);

    const result = await scanRepositoryFiles(files);

    // Save scan result in DB
    const scanRecord = await ScanResult.create({
      userId: req.user._id || req.user.id,
      repoFullName,
      score: result.score,
      issues: result.issues,
    });

    res.json(scanRecord);
  } catch (error) {
    console.error("Scan API Error:", error);
    res.status(500).json({ error: error.message || "Failed to complete repository scan" });
  }
});

// Get the latest scan for a specific repo
router.get("/api/scan/latest", ensureAuthenticated, async (req, res) => {
  const { repoFullName } = req.query;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName query parameter" });
  }

  try {
    const latest = await ScanResult.findLatest({
      userId: req.user._id || req.user.id,
      repoFullName,
    });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load latest scan" });
  }
});

// Get all scans for a specific repo to show history
router.get("/api/scan/history", ensureAuthenticated, async (req, res) => {
  const { repoFullName } = req.query;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName query parameter" });
  }

  try {
    const history = await ScanResult.findHistory({
      userId: req.user._id || req.user.id,
      repoFullName,
    });
    res.json(history || []);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load scan history" });
  }
});

// 3. Start Watch Mode (Register webhooks)
router.post("/api/watch/start", ensureAuthenticated, async (req, res) => {
  const { repoFullName, token: bodyToken } = req.body;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName parameter" });
  }

  try {
    const token = bodyToken || req.user.accessToken || "mock_token";
    const appUrl = "https://sharply-lepidopterous-penny.ngrok-free.dev";
    const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/webhook`;

    // Register Webhook with GitHub (or generate mock ID)
    const webhookId = await registerWebhook(repoFullName, token, webhookUrl);

    // Update Repo watch state in Database
    const userId = req.user._id || req.user.id;
    
    // Save watch record
    await GithubRepo.findOneAndUpdate(
      { userId, fullName: repoFullName },
      { isWatching: true, webhookId, name: repoFullName.split("/")[1] || repoFullName, repoId: Date.now() },
      { upsert: true ,
        returnDocument:"after",
      }
    );

    res.json({ success: true, webhookId });
  } catch (error) {
    console.error("Watch start failed:", error);
    res.status(500).json({ error: error.message || "Failed to start Watch Mode" });
  }
});

// 4. Stop Watch Mode (Unregister webhooks)
router.post("/api/watch/stop", ensureAuthenticated, async (req, res) => {
  const { repoFullName } = req.body;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName parameter" });
  }

  try {
    const userId = req.user._id || req.user.id;
    const repoRecord = await GithubRepo.findOne({ userId, fullName: repoFullName });

    if (repoRecord) {
      const token = req.user.accessToken || "mock_token";
      if (repoRecord.webhookId) {
        await unregisterWebhook(repoFullName, token, repoRecord.webhookId);
      }
      await GithubRepo.findOneAndUpdate(
        { userId, fullName: repoFullName },
        { isWatching: false, webhookId: null }
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to stop Watch Mode" });
  }
});

// 5. GitHub push Webhook listener
router.post("/api/webhook", async (req, res) => {
  const payload = req.body;
  if (payload.zen) {
    console.log("GitHub ping received — webhook is connected successfully ✅");
    return res.status(200).json({ success: true, message: "Ping received" });
  }
  const repoFullName = payload.repository?.full_name;
   // ADD THESE LOGS HERE — right at the top of the webhook route
  console.log("=== WEBHOOK FIRED ===");
  console.log("repoFullName:", repoFullName);
  console.log("before (base):", payload.before);
  console.log("after (head):", payload.after);
  console.log("commits count:", payload.commits?.length);
  if (!repoFullName) {
    return res.status(400).json({ error: "Invalid payload: Repository not found" });
  }

  try {
    // Determine which user is watching this repo
    const watchConfig = await GithubRepo.findOne({ fullName: repoFullName, isWatching: true });
    console.log("watchConfig found:", watchConfig ? "YES" : "NO");
    const userId = watchConfig ? watchConfig.userId : "demo-user-id";
    console.log("userId being used:", userId);
    // With this:
const repoOwner = repoFullName.split("/")[0]; // "vamshi241010"
const user = await User.findOne({ username: repoOwner });
console.log("user found:", user ? "YES — " + user.username : "NO");
     console.log("user found:", user ? "YES — " + user.username : "NO");
    console.log("token:", user?.accessToken ? "EXISTS" : "NULL");
    const token = user?user.accessToken:null;
    // Extract code changes from commits using gitDiff
    const commits = payload.commits || [];
    let gitDiffText = "";
    let affectedFilename = "src/index.ts";

    if (commits.length > 0) {
      // const message = commits[0].message || "Refactored logic";
      // const author = commits[0].author?.name || "developer";
      // changedLinesBlock = `Commit by ${author}: "${message}"\n`;
      if (commits[0].modified && commits[0].modified.length > 0) {
        affectedFilename = commits[0].modified[0];
      }
       }

    const headCommit = payload.after;
    const baseCommit = payload.before;

    if (headCommit && baseCommit && baseCommit !== "0000000000000000000000000000000000000000") {
      gitDiffText = await getCompareDiff(repoFullName, baseCommit, headCommit, token);
    } else if (headCommit) {
      gitDiffText = await getCommitDiff(repoFullName, headCommit, token);
    } else if (commits.length > 0) {
      gitDiffText = await getCommitDiff(repoFullName, commits[0].id, token);
    } else {
      gitDiffText = await getCommitDiff(repoFullName,null,token);
    }
    //   changedLinesBlock = "Incomplete commit event log.";
    // }

    // changedLinesBlock += `\nModified file: ${affectedFilename}\n+ export function calculateInterest(p, r, t) {\n+   return p * r * t;\n+ }`;

    // // Process unified gitDiff through Gemini Watch review
     const analysis = await analyzeWatchLines(gitDiffText);
    const issueText = analysis.issues.length > 0 
      ? `Severity: ${analysis.issues[0].severity.toUpperCase()} - ${analysis.issues[0].message}`
      : "No issues detected. Code is secure.";
    
    const lineNum = analysis.issues.length > 0 ? analysis.issues[0].line : 12;

    if(analysis.issues.length > 0 && analysis.issues[0].file){
      affectedFilename = analysis.issues[0].file;
    }
    // Create watch event record
    const watchEvent = await WatchEvent.create({
      userId,
      repoFullName,
      filename: affectedFilename,
      line: lineNum,
      issue: issueText,
    });

    // Broadcast Watch Event to all connected SSE streams
    broadcastSseEvent(watchEvent);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper for broadcasting SSE events
function broadcastSseEvent(event) {
  const sseData = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(sseData);
    } catch (e) {
      console.error("Error writing to SSE stream:", e);
    }
  });
}

// 6. Watch Event Simulator (Super Useful for Sandbox Testing!)
router.post("/api/watch/simulate", ensureAuthenticated, async (req, res) => {
  const { repoFullName } = req.body;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName" });
  }

  try {
    const userId = req.user._id || req.user.id;
    
    // define proper mock git diff structures 
    const mockPushes = [
      {
        filename: "src/routes/payment.ts",
        diff: `diff --git a/src/routes/payment.ts b/src/routes/payment.ts
index a1b2c3d..e5f6g7h 100644
--- a/src/routes/payment.ts
+++ b/src/routes/payment.ts
@@ -15,5 +15,7 @@ router.post("/charge", async (req, res) => {
   const { amount, token } = req.body;
+  // Debug logging
+  console.log("Processing payment request body:", req.body);
   const charge = await stripe.charges.create({
     amount,
     currency: "usd",
     source: token,
   });`,
        defaultIssue: "Severity: WARNING - Avoid logging complete req.body context, which contains raw credentials and credit card information.",
        defaultLine: 18
      },
      {
        filename: "src/utils/crypto.ts",
        diff: `diff --git a/src/utils/crypto.ts b/src/utils/crypto.ts
index b2c3d4e..f6g7h8i 100644
--- a/src/utils/crypto.ts
+++ b/src/utils/crypto.ts
@@ -40,3 +40,3 @@ export function hashPassword(password: string) {
-  return crypto.createHash("md5").update(password).digest("hex");
+  return crypto.createHash("md5").update(password).digest("hex"); // MD5 for fast security
 }`,
        defaultIssue: "Severity: ERROR - Use of weak encryption algorithm MD5. Upgrade to SHA-256 for password hashing.",
        defaultLine: 42
      },
      {
        filename: "src/controllers/authController.js",
         diff: `diff --git a/src/controllers/authController.js b/src/controllers/authController.js
index c3d4e5f..g7h8i9j 100644
--- a/src/controllers/authController.js
+++ b/src/controllers/authController.js
@@ -5,4 +5,5 @@ export async function login(req, res) {
   const { email, password } = req.body;
   const user = await User.findByEmail(email);
+  const tempToken = "temp-bypass-token-dev-only";
   if (!user) return res.status(401).json({ error: "Invalid credentials" });`,
        defaultIssue: "Severity: INFO - Unused variable 'tempToken' can be removed safely.",
        defaultLine: 8
      },
      {
        filename: "src/server.ts",
         diff: `diff --git a/src/server.ts b/src/server.ts
index d3e4f5g..h8i9j0k 100644
--- a/src/server.ts
+++ b/src/server.ts
@@ -10,3 +10,3 @@ const app = express();
 app.get("/health", (req, res) => {
-  res.send("OK");
+  res.status(200).json({ status: "healthy", timestamp: Date.now() });
 });`,
        defaultIssue: "No issues detected",
        defaultLine: 12
      }
    ];

    const randomPush = mockPushes[Math.floor(Math.random() * mockPushes.length)];

    // Run actual analysis over the mock unified gitDiff using Gemini API!
    const analysis = await analyzeWatchLines(randomPush.diff);

    const issueText = analysis.issues.length > 0 
      ? `Severity: ${analysis.issues[0].severity.toUpperCase()} - ${analysis.issues[0].message}`
      : randomPush.defaultIssue;

    const lineNum = analysis.issues.length > 0 ? analysis.issues[0].line : randomPush.defaultLine;
    const finalFilename = (analysis.issues.length > 0 && analysis.issues[0].file) ? analysis.issues[0].file : randomPush.filename;
    const watchEvent = await WatchEvent.create({
      userId,
      repoFullName,
      filename: finalFilename,
      line: lineNum,
      issue: issueText,
    });

    // Broadcast
    broadcastSseEvent(watchEvent);

    res.json({ success: true, event: watchEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical Watch events for a specific repo
router.get("/api/watch/events", ensureAuthenticated, async (req, res) => {
  const { repoFullName } = req.query;
  if (!repoFullName) {
    return res.status(400).json({ error: "Missing repoFullName query parameter" });
  }

  try {
    const events = await WatchEvent.find({
      userId: req.user._id || req.user.id,
      repoFullName,
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load watch history" });
  }
});

// 7. Server-Sent Events (SSE) Stream
router.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send a keep-alive ping immediately
  res.write("data: { \"ping\": true }\n\n");

  sseClients.push(res);

  // Connection close cleanup
  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// 8. Error Detective
router.post("/api/detect", ensureAuthenticated, async (req, res) => {
  const { code,repoFullName } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Missing code input parameter" });
  }

  try {

    let repoContext = "";
    if (repoFullName) {
      const user = await User.findById(req.user._id || req.user.id);
      const token = user ? user.accessToken : null;
      const files = await getRepositoryFiles(repoFullName, token);
      if (files && files.length > 0) {
        repoContext = `--- Repository Context files from ${repoFullName} ---\n`;
        files.forEach((file) => {
          repoContext += `\nFile: ${file.path}\nContent:\n${file.content}\n`;
        });
      }
    }

    const diagnosis = await detectErrorRootCause(code, repoContext);
    //const diagnosis = await detectErrorRootCause(code,repoContext);
    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to debug error snippet" });
  }
});

export default router;
