import { useState, useEffect } from "react";
import { Github, Play, Scan, Eye, BugPlay, Loader2, ArrowRight,ChevronLeft,ChevronRight, ShieldAlert,X } from "lucide-react";
import { motion , AnimatePresence} from "motion/react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ScanView from "./components/ScanView";
import WatchView from "./components/WatchView";
import ErrorDetectiveView from "./components/ErrorDetectiveView";
import LandingView from "./components/LandingView";

export default function App() {
  // Theme state stored in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("devpulse_theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // App views state
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeView, setActiveView] = useState("scan");

  // Repository data state
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory,setScanHistory] = useState([]);
  const [watchEvents, setWatchEvents] = useState([]);
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 
  // On-page toast notifications for live watch errors
  const [toasts, setToasts] = useState([]);

  // Helper to add a live error toast
  const addErrorToast = (eventData) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      repoFullName: eventData.repoFullName,
      filename: eventData.filename,
      line: eventData.line,
      issue: eventData.issue,
      timestamp: eventData.timestamp || Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 10000);
  };
  // Loading indicator states
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSimulatingPush, setIsSimulatingPush] = useState(false);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("devpulse_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("devpulse_theme", "light");
    }
  }, [darkMode]);

  // Load Auth Status on Mount
  const fetchUserStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          loadRepositories();
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error("Failed to load user auth status:", err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserStatus();
  }, []);

  // Listen for OAuth postMessage events from child popup
  useEffect(() => {
    const handleOAuthMessage = (event) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("3000")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        fetchUserStatus();
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // Load user repositories
  const loadRepositories = async () => {
    setIsLoadingRepos(true);
    try {
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setRepos(data || []);
      }
    } catch (err) {
      console.error("Failed to load repositories:", err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // Real-time SSE Stream listener for live reviews
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.ping) return; // ignore keep-alive pings

        // Prepend to watch events list if it corresponds to the currently watched repo
        if (selectedRepo && data.repoFullName === selectedRepo.fullName) {
          setWatchEvents((prev) => {
            // Check for duplicates
            if (prev.some((e) => e._id === data._id)) return prev;
            return [data, ...prev];
          });
        }
        
        // Check if this event contains a live watch error
        const isError = data.issue && data.issue.toLowerCase().includes("severity: error");
        if (isError) {
          // Trigger browser native desktop notification if permission is granted
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              const nativeNotif = new Notification(`⚠️ DevPulse Error: ${data.repoFullName}`, {
                body: `${data.filename} (Line ${data.line}): ${data.issue}`,
              });
              nativeNotif.onclick = () => {
                window.focus();
                setActiveTab("dashboard");
                setActiveView("watch");
                // Find and select the corresponding repo
                setRepos((prevRepos) => {
                  const targetRepo = prevRepos.find((r) => r.fullName === data.repoFullName);
                  if (targetRepo) {
                    setSelectedRepo(targetRepo);
                  }
                  return prevRepos;
                });
              };
            } catch (err) {
              // Ignore failure for native notification (e.g. within iframe sandboxes)
            }
          }

          // Trigger on-page sliding toast notification
          addErrorToast(data);
        }

        // Update watched status inside repos sidebar if necessary
        setRepos((prevRepos) =>
          prevRepos.map((r) =>
            r.fullName === data.repoFullName ? { ...r, isWatching: true } : r
          )
        );
      } catch (err) {
        console.error("Error parsing live watch event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource stream disconnected. Retrying...", err);
    };

    return () => {
      eventSource.close();
    };
  }, [user, selectedRepo]);

  // Handle repository selection change
  const handleSelectRepo = async (repo) => {
    setSelectedRepo(repo);
    setIsScanning(false);
    setScanResult(null);
    setScanHistory([]);
    setWatchEvents([]);

    // 1. Fetch latest ScanResult
    try {
      const res = await fetch(`/api/scan/latest?repoFullName=${encodeURIComponent(repo.fullName)}`);
      if (res.ok) {
        const data = await res.json();
        setScanResult(data || null);
      }
    } catch (err) {
      console.error("Error fetching latest scan report:", err);
    }

    // 2. Fetch all historic scans
    try {
      const res = await fetch(`/api/scan/history?repoFullName=${encodeURIComponent(repo.fullName)}`);
      if (res.ok) {
        const data = await res.json();
        setScanHistory(data || []);
      }
    } catch (err) {
      console.error("Error fetching scan history:", err);
    }


    // 3. Fetch historic WatchEvents
    try {
      const res = await fetch(`/api/watch/events?repoFullName=${encodeURIComponent(repo.fullName)}`);
      if (res.ok) {
        const data = await res.json();
        setWatchEvents(data || []);
      }
    } catch (err) {
      console.error("Error fetching watch history:", err);
    }
  };

  // Launch Code Scanner
  const handleTriggerScan = async () => {
    if (!selectedRepo) return;
    setIsScanning(true);
    setActiveView("scan");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: selectedRepo.fullName }),
      });
      if (res.ok) {
        const report = await res.json();
        setScanResult(report);
        //prepend new report to scan history
        setScanHistory((prev)=>[report,...prev]);
      }
    } catch (err) {
      console.error("Error executing repository scan:", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Register or unregister webhook (Toggle Watch Mode)
  const handleToggleWatch = async () => {
    if (!selectedRepo) return;
    const isCurrentlyWatching = selectedRepo.isWatching;
     // Ask for browser notification permission on toggling watch mode active
    if (!isCurrentlyWatching && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
    try {
      const endpoint = isCurrentlyWatching ? "/api/watch/stop" : "/api/watch/start";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: selectedRepo.fullName }),
      });

      if (res.ok) {
        const updatedRepo = { ...selectedRepo, isWatching: !isCurrentlyWatching };
        setSelectedRepo(updatedRepo);
        setRepos((prev) =>
          prev.map((r) => (r.fullName === selectedRepo.fullName ? updatedRepo : r))
        );
      }
    } catch (err) {
      console.error("Failed to toggle watch state:", err);
    }
  };

  // Simulate a Git Commit push to trigger SSE review
  const handleSimulatePush = async () => {
    if (!selectedRepo) return;
    setIsSimulatingPush(true);
    try {
      await fetch("/api/watch/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: selectedRepo.fullName }),
      });
    } catch (err) {
      console.error("Push simulation failed:", err);
    } finally {
      // Small visual delay to feel realistic
      setTimeout(() => setIsSimulatingPush(false), 800);
    }
  };

  // Submit Error / broken code block to Detective
  const handleAnalyzeError = async (code,repoFullName) => {
    setIsAnalyzingError(true);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code ,repoFullName}),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Debugging analyze failed:", err);
      return null;
    } finally {
      setIsAnalyzingError(false);
    }
  };

  // Handle standard OAuth login popup window
  const handleLogin = () => {
    setIsLoggingIn(true);
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "/auth/github",
      "github_oauth_popup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      alert("Popup blocker detected! Please allow popups to sign in with GitHub.");
      setIsLoggingIn(false);
      return;
    }

    // Watch popup close to clear loading state
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsLoggingIn(false);
      }
    }, 1000);
  };

  // Handle sandbox instant login
  const handleDemoLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadRepositories();
      }
    } catch (err) {
      console.error("Demo authentication failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out
  const handleLogout = async () => {
    try {
      const res = await fetch("/auth/logout");
      if (res.ok) {
        setUser(null);
        setRepos([]);
        setSelectedRepo(null);
        setScanResult(null);
        setWatchEvents([]);
        setActiveTab("dashboard");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <span className="text-xs font-serif text-zinc-400 mt-4">Initializing DevPulse Framework...</span>
      </div>
    );
  }

  // Not logged in -> Show Hero Landing View
  if (!user) {
    return (
      <LandingView
        onLogin={handleLogin}
        onDemoLogin={handleDemoLogin}
        isLoggingIn={isLoggingIn}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    );
  }

  // Logged in -> Render Main application frame
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 flex flex-col font-sans">
      {/* Universal Navbar */}
      <Navbar
        user={user}
        darkMode={darkMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={handleLogout}
         isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Layout Workspace */}
      {activeTab === "dashboard" ? (
        <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-61px)] overflow-hidden relative">
          
          {/*Collapsable Left search sidebar */}
           <div
            className={`transition-all duration-300 ease-in-out shrink-0 border-r border-gray-100 dark:border-zinc-900 h-full flex flex-col ${
              isSidebarOpen ? "w-full md:w-80" : "w-0 border-r-0 overflow-hidden"
            }`}
          >
          <Sidebar
            repos={repos}
            selectedRepo={selectedRepo}
            onSelectRepo={handleSelectRepo}
            onRefresh={loadRepositories}
            isLoading={isLoadingRepos}
          onToggleSidebar={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Mini floating edge trigger button to open/close sidebar with glide animation */}
          <div
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-45 transition-all duration-300"
            style={{
              left: isSidebarOpen ? "320px" : "0px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-5 h-10 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md shadow-md hover:bg-gray-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center cursor-pointer transition-all focus:outline-none"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </motion.button>
          </div>


          {/* Right workspace area */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-black transition-colors duration-300">
            {selectedRepo ? (
              <div className="flex flex-col min-h-full">
                {/* Selected Repo Header block */}
                <div className="border-b border-gray-100 dark:border-zinc-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-black transition-colors duration-300">
                  <div>
                    <h1 className="text-md font-bold tracking-tight">{selectedRepo.fullName}</h1>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1">{selectedRepo.description}</p>
                  </div>

                  {/* Toggle subviews tabs: Scan vs Watch */}
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-950 p-1 rounded-md border border-gray-100 dark:border-zinc-900 self-start">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      id="subview-scan-btn"
                      onClick={() => setActiveView("scan")}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                        activeView === "scan"
                          ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      <Scan className="w-3.5 h-3.5 text-blue-600" />
                      Scan Report
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      id="subview-watch-btn"
                      onClick={() => setActiveView("watch")}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                        activeView === "watch"
                          ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Watch Live
                    </motion.button>
                  </div>
                </div>

                {/* Subview contents */}
                <div className="flex-1 p-2">
                  {activeView === "scan" ? (
                    <ScanView
                      scanResult={scanResult}
                      isScanning={isScanning}
                      onTriggerScan={handleTriggerScan}
                      scanHistory={scanHistory}
                      onSelectHistoricalScan = {setScanResult}
                    />
                  ) : (
                    <WatchView
                      watchEvents={watchEvents}
                      isWatching={selectedRepo.isWatching}
                      onToggleWatch={handleToggleWatch}
                      onSimulatePush={handleSimulatePush}
                      isSimulating={isSimulatingPush}
                      activeRepoName={selectedRepo.fullName}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center h-full">
                <div className="w-10 h-10 border border-gray-100 dark:border-zinc-900 rounded bg-gray-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 mb-4">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold tracking-tight mb-1">Select a Repository</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Choose an active repository from the left panel to scan files, monitor line changes, or run continuous AI-driven review pipelines.
                </p>
              </div>
            )}
          </main>
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorDetectiveView onAnalyze={handleAnalyzeError} 
          isAnalyzing={isAnalyzingError} 
          selectedRepo={selectedRepo}
          repos={repos}
          onSelectRepo={handleSelectRepo}
          />
        </main>
      )}
      
      {/* Elegant sliding toast container for Watch Mode Error Notifications */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-950/80 shadow-2xl rounded-lg p-4 flex flex-col gap-2.5 relative overflow-hidden text-black dark:text-white"
              >
                {/* Visual red vertical marker bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-red-600 dark:text-red-400">
                        Watch Mode Error
                      </span>
                      <h4 className="text-xs font-bold font-sans text-zinc-900 dark:text-zinc-100 truncate max-w-[210px]">
                        {toast.repoFullName}
                      </h4>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 pl-1.5 min-w-0">
                  <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                    File: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{toast.filename}</span> (Line {toast.line})
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans line-clamp-2">
                    {toast.issue}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-900/60 pt-2 pl-1.5">
                  <span className="text-[9px] font-mono text-zinc-400">
                    {new Date(toast.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => {
                      // Navigate to the watch view
                      setActiveTab("dashboard");
                      setActiveView("watch");
                      // Select the target repo
                      setRepos((prevRepos) => {
                        const targetRepo = prevRepos.find((r) => r.fullName === toast.repoFullName);
                        if (targetRepo) {
                          setSelectedRepo(targetRepo);
                        }
                        return prevRepos;
                      });
                      // Dismiss this toast
                      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    }}
                    className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Go to Watch Live &rarr;
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
