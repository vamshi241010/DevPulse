import { Eye, ShieldAlert, CheckCircle, Zap, RefreshCw, StopCircle, Radio } from "lucide-react";
import { motion } from "motion/react";

export default function WatchView({
  watchEvents,
  isWatching,
  onToggleWatch,
  onSimulatePush,
  isSimulating,
  activeRepoName,
}) {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans">
      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border border-gray-100 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-950/50 rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isWatching ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-400"></span>
              )}
            </span>
            <h3 className="text-sm font-bold tracking-tight">
              Watch Mode: {isWatching ? "Active" : "Inactive"}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            Continuous background review listens to GitHub push webhooks and reviews changed lines via SSE.
          </p>
        </div>

        {/* Watch Mode Controls */}
        <div className="flex items-center gap-2">
          {isWatching && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              id="simulate-push-btn"
              onClick={onSimulatePush}
              disabled={isSimulating}
              className="flex items-center gap-1.5 border border-gray-100 dark:border-zinc-900 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-bounce text-blue-600" : ""}`} />
              Simulate Push
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            id="toggle-watch-btn"
            onClick={onToggleWatch}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded transition-all shadow-sm cursor-pointer ${
              isWatching
                ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isWatching ? (
              <>
                <StopCircle className="w-3.5 h-3.5" />
                Stop Watching
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                Start Watching
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Live Stream Board */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-funnel font-bold tracking-wider uppercase text-zinc-800 dark:text-zinc-300">
            Real-time SSE Notification Stream ({watchEvents.length})
          </h4>
          {isWatching && (
            <div className="flex items-center gap-1.5 font-sans text-[10px] text-blue-600 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>WATCHING REPO...</span>
            </div>
          )}
        </div>

        {watchEvents.length === 0 ? (
          <div className="border border-dashed border-gray-100 dark:border-zinc-900 p-16 rounded-lg text-center space-y-3">
            <Eye className="w-8 h-8 text-zinc-400 mx-auto" />
            <h5 className="text-xs font-bold">No Watch Events Logged</h5>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
              {isWatching
                ? 'Webhook registered! DevPulse is ready. Push some commits to your repo, or click "Simulate Push" above to trigger a test commit.'
                : 'Activate Watch Mode first to initiate connection and register the webhook listener.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-hidden">
            {watchEvents.map((event) => {
              const isClean = event.issue.toLowerCase().includes("no issues");
              const isError = event.issue.toLowerCase().includes("severity: error");
              const isWarning = event.issue.toLowerCase().includes("severity: warning");

              // Status styles
              let containerClass = "border-gray-100 dark:border-zinc-900";
              let badgeColor = "bg-gray-50 text-gray-500 border-gray-100";
              let badgeText = "Clean";
              let badgeIcon = <CheckCircle className="w-3 h-3 text-green-500" />;

              if (isError) {
                containerClass = "border-red-300 dark:border-red-950 bg-red-50/5 dark:bg-red-950/5";
                badgeColor = "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-500 dark:border-red-950";
                badgeText = "Error";
                badgeIcon = <ShieldAlert className="w-3 h-3 text-red-600" />;
              } else if (isWarning) {
                containerClass = "border-yellow-100 dark:border-yellow-950 bg-yellow-50/5 dark:bg-yellow-950/5";
                badgeColor = "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-500 dark:border-yellow-950";
                badgeText = "Warning";
                badgeIcon = <ShieldAlert className="w-3 h-3 text-yellow-500" />;
              }

              return (
                <div
                  key={event._id}
                  className={`border p-4 rounded-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-zinc-950 ${containerClass}`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-sans font-semibold text-black dark:text-white">
                        {event.filename}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-funnel">
                        Line {event.line}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-funnel">
                      {event.issue}
                    </p>

                    <div className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500 pt-0.5">
                      Pushed on: {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-funnel font-bold uppercase border px-2 py-0.5 rounded self-start ${badgeColor}`}>
                    {badgeIcon}
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
