import { Moon, Sun, LogOut, Terminal, LayoutDashboard,PanelLeftClose,PanelLeftOpen } from "lucide-react";
import { motion } from "motion/react";

export default function Navbar({
  user,
  darkMode,
  activeTab,
  onTabChange,
  onToggleDarkMode,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
}) {
  return (
    <nav className="border-b border-gray-100 dark:border-zinc-900 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans sticky top-0 z-50 px-6 py-3.5 flex justify-between items-center">
      {/* Left side: Brand Logo + Toggle + Tabs */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange("dashboard")}>
          <div className="w-7 h-7 rounded border border-black dark:border-white flex items-center justify-center font-bold text-sm bg-black text-white dark:bg-white dark:text-black">
            D
          </div>
          <span className="font-bold tracking-tight text-lg">DevPulse</span>
        </div>

        {/* Sidebar Toggle Button (Only on Dashboard tab) */}
        {activeTab === "dashboard" && onToggleSidebar && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="p-1.5 rounded border border-gray-100 dark:border-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-blue-600" />
            )}
          </motion.button>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-950 p-1 rounded-md border border-gray-100 dark:border-zinc-900">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm font-semibold"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => onTabChange("detective")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "detective"
                ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm font-semibold"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Error Detective
          </motion.button>
        </div>
      </div>

      {/* Right side: Dark Mode + User Info + Logout */}
      <div className="flex items-center gap-4">
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

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 dark:border-zinc-900">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800"
          />
          <span className="text-xs font-semibold hidden sm:inline-block max-w-[120px] truncate">
            {user.username}
          </span>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05, x: 1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={onLogout}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 rounded transition-all text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer"
          title="Sign out of DevPulse"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}
