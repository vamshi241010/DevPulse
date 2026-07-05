import { motion } from "motion/react";
import { Github, Scan, Eye, BugPlay, ShieldCheck, Sun, Moon } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function LandingView({
  onLogin,
  onDemoLogin,
  isLoggingIn,
  darkMode,
  onToggleDarkMode,
}) {
  return (
    <div className="min-h-screen bg-white text-black transition-colors duration-300 dark:bg-black dark:text-white flex flex-col font-sans">
      {/* Landing Navbar */}
      <header className="border-b border-gray-100 dark:border-zinc-900 px-6 py-4 flex justify-between items-center bg-white dark:bg-black transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border border-black dark:border-white flex items-center justify-center font-bold text-lg">
            D
          </div>
          <span className="font-semibold tracking-tight text-xl">DevPulse</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dark/Light mode toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={onToggleDarkMode}
            className="w-8 h-8 rounded border border-gray-100 dark:border-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            id="nav-demo-btn"
            onClick={onDemoLogin}
            disabled={isLoggingIn}
            className="hidden sm:inline-flex text-xs px-3 py-1.5 border border-gray-200 dark:border-zinc-800 rounded hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all font-medium cursor-pointer"
          >
            Try Sandbox Mode
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            id="nav-login-btn"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 px-4 py-2 rounded transition-all shadow-sm cursor-pointer"
          >
            <Github className="w-4 h-4" />
            {isLoggingIn ? "Connecting..." : "Login with GitHub"}
          </motion.button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-serif uppercase tracking-widest px-3 py-1 rounded-full text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            AI-Driven Continuous Review Engine
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight dark:text-white">
            Your AI Co-Engineer, <br className="hidden sm:block" />
            <span className="text-blue-600">Always Watching</span>
          </h1>
          
          <p className="text-base sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {/* Catch bugs before your users do. Powered by Gemini 1.5 Flash to deliver instant security reports, line-by-line watch notifications, and automated debugging fixes. */}
            Code smarter. Ship faster. Stay secure.


          </p>
          <p className="text-base sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {/* Catch bugs before your users do. Powered by Gemini 1.5 Flash to deliver instant security reports, line-by-line watch notifications, and automated debugging fixes. */}
           Continuous AI-powered code review for every repository, every commit, every developer.


          </p>

          {/* Landing Actions / Login Card Page 2 */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03, y: -1.5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              id="hero-login-btn"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded transition-all shadow cursor-pointer"
            >
              <Github className="w-5 h-5" />
              Get Started with GitHub
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              id="hero-demo-btn"
              onClick={onDemoLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 px-8 py-3.5 rounded transition-all font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Explore Demo Sandbox
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Cards Grid with Staggered Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          <FeatureCard
            icon={Scan}
            title="Deep Repo Scan"
            description="Scan your complete codebase tree in seconds. Analyzes imports, security risks, error handling, and scores repository health."
            delay={0.1}
          />
          <FeatureCard
            icon={Eye}
            title="Watch Mode"
            description="Registers real GitHub commit webhooks. Listen continuously to push events, reviews edits line-by-line via SSE."
            delay={0.2}
          />
          <FeatureCard
            icon={BugPlay}
            title="Error Detective"
            description="Paste standard stack traces or broken code files. Diagnose root causes immediately, view code diffs, and copy ready-to-merge fixes."
            delay={0.3}
          />
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-900 py-8 px-6 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-black transition-colors duration-300">
        <p>© 2026 DevPulse AI Co-Engineer. All rights reserved.</p>
      </footer>
    </div>
  );
}
