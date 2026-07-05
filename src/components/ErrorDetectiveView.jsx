import { useState } from "react";
import { Terminal, Bug, Play, Copy, Check, FileCheck,FolderGit2,ChevronDown } from "lucide-react";
import { motion } from "motion/react";

export default function ErrorDetectiveView({ onAnalyze, isAnalyzing, selectedRepo,repos=[],onSelectRepo }) {
  const [codeInput, setCodeInput] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    
    const result = await onAnalyze(codeInput,selectedRepo?.fullName || null);
    if (result) {
      setDiagnosis(result);
    }
  };

  const handleCopyFix = () => {
    if (!diagnosis) return;
    navigator.clipboard.writeText(diagnosis.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans">
      {/* Intro Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Error Detective</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paste standard compiler errors, runtime crashes, stack traces, or broken code snippets for automated senior-level AI debugging.
        </p>
      </div>

       {/* Repository Context Linking Option */}
      <div className="border border-gray-100 dark:border-zinc-900 rounded-lg p-4 bg-gray-50/30 dark:bg-zinc-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight">Repository Debugging Context</h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Link an active repository to load directory structure and file contents into the detective's context.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedRepo ? (
              <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded border border-green-100 dark:border-green-950 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-950 font-medium">
                Standalone Mode
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <select
              value={selectedRepo ? selectedRepo.fullName : ""}
              onChange={(e) => {
                const found = repos.find((r) => r.fullName === e.target.value);
                if (found) onSelectRepo(found);
              }}
              className="w-full text-xs font-medium rounded border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none pr-8"
            >
              <option value="" disabled={!!selectedRepo}>-- Connect a Repository --</option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.fullName}>
                  {repo.fullName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {selectedRepo && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 italic">
              <span className="font-semibold text-zinc-600 dark:text-zinc-350">Linked:</span> {selectedRepo.fullName}
            </p>
          )}
        </div>
      </div>

      {/* Code Textarea Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative border font-sans border-gray-100 dark:border-zinc-900 rounded bg-gray-50/50 dark:bg-zinc-950/50">
          <textarea
            id="detective-textarea"
            rows={10}
            placeholder={`Paste your error message or broken code here...\n\nExample:\nReferenceError: totalAmount is not defined at processOrder (src/utils/payment.js:14:12)`}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full text-xs font-funnel p-4 bg-transparent text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none resize-y"
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500">
            Supports TS, JS, Python, Go, and standard stack trace logs.
          </span>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            id="detective-submit-btn"
            type="submit"
            disabled={isAnalyzing || !codeInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Bug className="w-3.5 h-3.5 animate-bounce" />
                Diagnosing Error...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" />
                Detect Root Cause
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Analysis Result */}
      {isAnalyzing && (
        <div className="border border-gray-100 dark:border-zinc-900 p-12 rounded-lg text-center space-y-3 bg-gray-50/20 dark:bg-zinc-950/20">
          <Terminal className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
          <h4 className="text-xs font-semibold font-sans">Debugging with Gemini Flash...</h4>
        </div>
      )}

      {!isAnalyzing && diagnosis && (
        <div className="border border-gray-100 dark:border-zinc-900 rounded-lg overflow-hidden space-y-6 p-6 bg-white dark:bg-zinc-950/40">
          {/* Header Row */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-zinc-900">
            <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-100 dark:border-red-950">
              <Bug className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Analysis Verdict</h3>
              <p className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500">
                Location: <span className="font-semibold text-black dark:text-white">{diagnosis.file}</span>, Line <span className="font-semibold text-black dark:text-white">{diagnosis.line}</span>
              </p>
            </div>
          </div>

          {/* Root Cause Details */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold font-sans tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Root Cause
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold">
              {diagnosis.rootCause}
            </p>
          </div>

          {/* Explanation Text */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold font-sans tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Technical Explanation
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {diagnosis.explanation}
            </p>
          </div>

          {/* Code Diff Display */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold font-sans tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                Proposed Code Correction
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                id="copy-fix-btn"
                onClick={handleCopyFix}
                className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded border border-gray-100 dark:border-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    Copied Fix!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </motion.button>
            </div>

            {/* Side-by-side or stacked diff block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Code */}
              <div className="border border-red-100 dark:border-red-950/50 bg-red-50/30 dark:bg-red-950/5 rounded overflow-hidden">
                <div className="px-4 py-2 bg-red-100/50 dark:bg-red-950/20 text-[10px] font-sans font-bold text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-950/30">
                  Original Code
                </div>
                <pre className="p-4 text-[11px] font-funnel whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">
                  {diagnosis.oldCode}
                </pre>
              </div>

              {/* Fixed Code */}
              <div className="border border-green-100 dark:border-zinc-900/50 bg-green-50/20 dark:bg-zinc-950/5 rounded overflow-hidden">
                <div className="px-4 py-2 bg-green-100/40 dark:bg-zinc-900/40 text-[10px] font-sans font-bold text-green-600 dark:text-green-400 border-b border-green-100 dark:border-zinc-900/30">
                  Proposed Fix
                </div>
                <pre className="p-4 text-[11px] font-funnel whitespace-pre-wrap break-words text-black dark:text-white font-semibold">
                  {diagnosis.fixedCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
