import { useState } from "react";
import { Search, FolderGit2, Star, RefreshCw, PanelLeftClose } from "lucide-react";
import { motion } from "motion/react";

export default function Sidebar({
  repos,
  selectedRepo,
  onSelectRepo,
  onRefresh,
  isLoading,
  onToggleSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter repositories based on search query
  const filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full h-full flex flex-col transition-colors duration-300">
      {/* Header with Search and Refresh */}
      <div className="p-4 border-b border-gray-50 dark:border-zinc-950 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-sans font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-300">
            Repositories ({repos.length})
          </span>
            <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1, rotate: isLoading ? 0 : 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded border border-gray-100 dark:border-zinc-900 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh repository list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
          {onToggleSidebar && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={onToggleSidebar}
                className="p-1.5 rounded border border-gray-100 dark:border-zinc-900 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Search input bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-900 rounded bg-gray-50 dark:bg-zinc-950 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Repositories Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-600 font-sans space-y-2">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto text-zinc-400" />
            <span>Fetching GitHub Repos...</span>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-600 font-sans">
            {searchQuery ? "No repositories matched." : "No repositories found."}
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const isSelected = selectedRepo?.fullName === repo.fullName;
            return (
              <motion.button
               whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={repo.id}
                onClick={() => onSelectRepo(repo)}
                className={`w-full text-left p-4 rounded-lg-border transition-all duration-200 flex flex-col gap-2 cursor-pointer shadow-sm ${
                  isSelected
                    ? "bg-blue-50/20 dark:bg-blue-950/10 border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/30 dark:ring-blue-400/30"
                    : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-md"
                }`}
              >
                 <div className="flex items-start gap-2.5 justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FolderGit2 className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-500 dark:text-blue-400" : "text-zinc-400"}`} />
                    <span className={`text-xs font-bold truncate ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-black dark:text-white"}`}>
                      {repo.name}
                    </span>
                  </div>
                  {repo.isWatching ? (
                    <span className="flex items-center gap-1 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-sans font-bold tracking-tight px-1.5 py-0.5 rounded border border-green-500/20 uppercase">
                      Live
                    </span>
                  ) : null}
                </div>

                {repo.description ? (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {repo.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-300 dark:text-zinc-600 italic">
                    No description provided
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] font-sans text-zinc-400 dark:text-zinc-500 mt-1 border-t border-gray-50 dark:border-zinc-900/60 pt-2">
                  <span className="truncate max-w-[120px]">
                    {repo.fullName}
                  </span>
                  
                  <div className="flex items-center gap-2.5 shrink-0">
                    {repo.language && (
                      <span className="bg-gray-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-gray-100 dark:border-zinc-800 text-[9px]">
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {repo.stars}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </aside>
  );
}
