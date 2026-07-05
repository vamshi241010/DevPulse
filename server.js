import express from "express";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/db.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In Cloud Run / proxy environments, we must trust the reverse proxy to secure cookies
  app.set("trust proxy", 1);

  // Global parsing middleware (must be registered BEFORE routers)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration optimized for AI Studio preview iframe context
  // const isProduction = process.env.NODE_ENV === "production";
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET || "na_password_na_istam",
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       secure: isProduction,       // Default to true for AI Studio iframe context (requires HTTPS)
  //       sameSite: "none",   // Default to none for cross-origin iframe context
  //       httpOnly: true,
  //       maxAge: 24 * 60 * 60 * 1000, // 24 hours
  //     },
  //   })
  // );

  const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "na_password_na_istam",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
  // Dynamic session cookie adjustment for local localhost testing without HTTPS
  // app.use((req, res, next) => {
  //   const host = req.headers.host || "";
  //   const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("0.0.0.0");
  //   if (isLocal && req.session && req.session.cookie) {
  //     req.session.cookie.secure = false;
  //     req.session.cookie.sameSite = "lax";
  //   }
  //   next();
  // });

  // Passport middleware initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Import full-stack routing modules
  const { default: authRouter } = await import("./server/routes/auth.js");
  const { default: apiRouter } = await import("./server/routes/api.js");

  // Mount routes
  app.use(authRouter);
  app.use(apiRouter);

  // Serve static UI assets or integrate Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Express with Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Starting Express in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 DevPulse Express Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("💥 Server failed to start:", error);
});
