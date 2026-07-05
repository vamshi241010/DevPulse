import { Router } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User.js";

const router = Router();

// Configure Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Configure GitHub OAuth Strategy if credentials exist
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const appUrl = process.env.APP_URL || "http://localhost:3000";

if (clientID && clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${appUrl.replace(/\/$/, "")}/auth/github/callback`,
        scope: ["repo", "read:user"],
      },
      async (accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });
          if (!user) {
            user = await User.create({
              githubId: profile.id,
              username: profile.username || profile.displayName || "github_user",
              avatarUrl: profile.photos?.[0]?.value || "https://avatars.githubusercontent.com/u/9919?v=4",
              accessToken,
            });
          } else {
            // Update token in db
            user.accessToken = accessToken;
            if (user.save) {
              await user.save();
            } else {
              // file fallback updates via re-creation or updating
              await User.create(user);
            }
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.log("⚠️ GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET not defined. Real GitHub Login is disabled, falling back to Sandboxed Demo.");
}

// 1. Initiate GitHub OAuth login
router.get("/auth/github", (req, res, next) => {
  if (!clientID || !clientSecret) {
    return res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; padding: 20px; background: #fafafa; color: #111;">
          <h2>OAuth Configuration Missing</h2>
          <p>This application is running in preview sandbox. Please define these variables in your AI Studio secrets panel:</p>
          <pre style="background: #eaeaea; padding: 10px; border-radius: 4px;">GITHUB_CLIENT_ID\nGITHUB_CLIENT_SECRET</pre>
          <hr />
          <p><b>Quick Option:</b> Close this window and click the "Try Sandbox Mode" button on the DevPulse landing page to test immediately with high-quality mock data!</p>
          <button onclick="window.close()" style="padding: 10px 15px; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Close Window</button>
        </body>
      </html>
    `);
  }
  passport.authenticate("github")(req, res, next);
});

// 2. GitHub OAuth Callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login-failed" }),
  (req, res) => {
    // Return HTML popup helper to notify main page via postMessage and close popup
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #fff; margin: 0; text-align: center;">
          <h3 style="margin-bottom: 5px;">Auth Successful!</h3>
          <p style="color: #666; margin-top: 0;">Synchronizing with DevPulse Dashboard...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS" }, "*");
              window.close();
            } else {
              window.location.href = "/dashboard";
            }
          </script>
        </body>
      </html>
    `);
  }
);

// 3. Demo Login for Sandbox / Demonstration
router.post("/api/auth/demo", async (req, res) => {
  try {
    // Check if demo user exists, if not create
    let user = await User.findOne({ githubId: "demo-user-id" });
    if (!user) {
      user = await User.create({
        githubId: "demo-user-id",
        username: "demo-engineer",
        avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
        accessToken: "mock_github_access_token",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to establish demo session" });
      }
      return res.json({ message: "Logged in successfully to sandbox", user });
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Demo login failed" });
  }
});

// 4. Get Current Auth User Status
router.get("/api/auth/status", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// 5. Logout
router.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error during logout" });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

export default router;
