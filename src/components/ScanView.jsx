// import { useState } from "react";
// import { ChevronDown, ChevronRight, AlertTriangle, AlertOctagon, Info, FileCode, CheckCircle2,RefreshCw,Clock,History } from "lucide-react";
// import { motion } from "motion/react";

// export default function ScanView({ scanResult, isScanning, onTriggerScan, scanHistory = [], onSelectHistoricalScan }) {
//   // Store which file sections are currently expanded
//   const [expandedFiles, setExpandedFiles] = useState({});

//   const toggleFile = (filename) => {
//     setExpandedFiles((prev) => ({
//       ...prev,
//       [filename]: !prev[filename],
//     }));
//   };

//    const formatTimeAgo = (dateInput) => {
//     if (!dateInput) return "";
//     const date = new Date(dateInput);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours}h ago`;
//     return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
//   };

//   if (isScanning) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white dark:bg-black transition-colors duration-300 font-sans">
//         <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin mb-6" />
//         <h3 className="text-sm font-bold tracking-tight mb-2">Analyzing Repository Files...</h3>
//         <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm text-center">
//           Gemini 1.5 Flash is inspecting your imports, syntax, hardcoded credentials, and error safety. This takes a few moments.
//         </p>
//       </div>
//     );
//   }
// let issuesByFile = {};
//   let errorsCount = 0;
//   let warningsCount = 0;
//   let infoCount = 0;
//   let score = 100;
//   let circumference = 0;
//   let strokeDashoffset = 0;
//   if (scanResult) {
//     scanResult.issues.forEach((issue) => {
//       if (!issuesByFile[issue.file]) {
//         issuesByFile[issue.file] = [];
//       }
//       issuesByFile[issue.file].push(issue);
//     });

//     errorsCount = scanResult.issues.filter((i) => i.severity === "error").length;
//     warningsCount = scanResult.issues.filter((i) => i.severity === "warning").length;
//     infoCount = scanResult.issues.filter((i) => i.severity === "info").length;

//     score = scanResult.score;
//     const radius = 50;
//     circumference = 2 * Math.PI * radius;
//     strokeDashoffset = circumference - (score / 100) * circumference;
//   }
//     // return (
//     //   <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-black transition-colors duration-300 font-sans border border-dashed border-gray-100 dark:border-zinc-900 rounded-lg m-6">
//     //     <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded flex items-center justify-center mb-4">
//      return (
//     <div className="p-6 space-y-6 max-w-6xl mx-auto bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans">
//       {/* Header Block with Rescan Trigger */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-900 pb-5">
//         <div className="space-y-1">
//           <h2 className="text-xl font-bold tracking-tight">Code Security & Health Scan</h2>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400">
//             Audit dependencies, verify syntax, identify vulnerabilities, and monitor overall quality standards.
//           </p>
//         </div>
//         {scanResult && (
//           <motion.button
//             whileHover={{ scale: 1.03, y: -1 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={onTriggerScan}
//             disabled={isScanning}
//             className="flex items-center gap-1.5 self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all cursor-pointer disabled:opacity-50"
//           >
//             <RefreshCw className="w-3.5 h-3.5" />
//             Rescan Codebase
//           </motion.button>
//         )}
//       </div>

//       {/* Main Grid: Left side Active Report, Right side History Panel */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
//         {/* Left column: Active Scan Content */}
//         <div className="lg:col-span-3 space-y-6">
//           {!scanResult ? (
//             <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-100 dark:border-zinc-900 rounded-lg bg-gray-50/10 dark:bg-zinc-950/5">
//           <FileCode className="w-6 h-6 text-zinc-400" />
//         </div>
//         <h3 className="text-sm font-bold tracking-tight mb-1">No Scan History Loaded</h3>
//         <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">
//           Launch a deep scan to evaluate code security, quality standards, and overall repository health.
//         </p>
//         <motion.button
//           whileHover={{ scale: 1.05, y: -1 }}
//           whileTap={{ scale: 0.95 }}
//           transition={{ type: "spring", stiffness: 400, damping: 20 }}
//           id="trigger-first-scan-btn"
//           onClick={onTriggerScan}
//           className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded transition-all shadow-sm cursor-pointer"
//         >
//           Scan Codebase Now
//         </motion.button>
//       </div>
//           ):(
//             <>
//       {/* Overview Block */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-6 rounded-lg">
//         {/* Health score circle */}
//         <div className="flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-zinc-900 md:col-span-1">
//           <div className="relative w-32 h-32 flex items-center justify-center">
//             <svg className="w-full h-full transform -rotate-90">
//               {/* Background circle */}
//               <circle
//                 cx="64"
//                 cy="64"
//                 r="50"
//                 className="stroke-gray-100 dark:stroke-zinc-900 fill-none"
//                 strokeWidth="8"
//               />
//               {/* Foreground circle */}
//               <circle
//                 cx="64"
//                 cy="64"
//                 r="50"
//                 className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
//                 strokeWidth="8"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//               />
//             </svg>
//             <div className="absolute text-center">
//               <span className="text-3xl font-black tracking-tighter">{score}</span>
//               <span className="text-[10px] block font-sans text-zinc-400 uppercase">Health Score</span>
//             </div>
//           </div>
//         </div>

//         {/* Issue counters */}
//         <div className="md:col-span-2 space-y-4">
//           <div>
//             <h2 className="text-lg font-bold tracking-tight">Active Scan Report</h2>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
//               <Clock className="w-3.5 h-3.5 text-zinc-400"/>
//               Completed on: {new Date(scanResult.createdAt).toLocaleString()}
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-4">
//             <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
//               <div className="w-2 h-2 rounded-full bg-red-600" />
//               <div className="text-xs">
//                 <span className="font-bold">{errorsCount}</span> <span className="text-zinc-500">Errors</span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
//               <div className="w-2 h-2 rounded-full bg-yellow-500" />
//               <div className="text-xs">
//                 <span className="font-bold">{warningsCount}</span> <span className="text-zinc-500">Warnings</span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
//               <div className="w-2 h-2 rounded-full bg-zinc-400" />
//               <div className="text-xs">
//                 <span className="font-bold">{infoCount}</span> <span className="text-zinc-500">Info</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Issues Breakdown */}
//       <div className="space-y-4">
//         <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
//           Detected Vulnerabilities & Code Smells ({scanResult.issues.length})
//         </h3>

//         {scanResult.issues.length === 0 ? (
//           <div className="border border-green-100 dark:border-zinc-900 bg-green-50/20 dark:bg-zinc-950/20 p-8 rounded-lg text-center space-y-2">
//             <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
//             <h4 className="text-sm font-bold text-green-700 dark:text-green-500">Perfect Health!</h4>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
//               No structural defects, vulnerabilities, or bad habits were identified in your repository.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {Object.entries(issuesByFile).map(([filename, issues]) => {
//               const isCollapsed = expandedFiles[filename] === false;
//               return (
//                 <div
//                   key={filename}
//                   className="border border-gray-100 dark:border-zinc-900 rounded bg-white dark:bg-zinc-950 overflow-hidden"
//                 >
//                   <button
//                     onClick={() => toggleFile(filename)}
//                     className="w-full text-left p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-50 dark:border-zinc-900 flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-zinc-900/80 cursor-pointer"
//                   >
//                     <div className="flex items-center gap-2">
//                       <FileCode className="w-4 h-4 text-zinc-400" />
//                       <span className="text-xs font-semibold font-sans tracking-tight text-black dark:text-white">
//                         {filename}
//                       </span>
//                       <span className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
//                         {issues.length} {issues.length === 1 ? "issue" : "issues"}
//                       </span>
//                     </div>
//                     {isCollapsed ? (
//                       <ChevronRight className="w-4 h-4 text-zinc-400" />
//                     ) : (
//                       <ChevronDown className="w-4 h-4 text-zinc-400" />
//                     )}
//                   </button>

//                   {!isCollapsed && (
//                     <div className="divide-y divide-gray-50 dark:divide-zinc-900">
//                       {issues.map((issue, index) => {
                       
//                         let badgeClass = "";
//                         let icon = null;
//                         if (issue.severity === "error") {
//                           badgeClass = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500 border-red-100 dark:border-red-950";
//                           icon = <AlertOctagon className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />;
//                         } else if (issue.severity === "warning") {
//                           badgeClass = "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-500 border-yellow-100 dark:border-yellow-950";
//                           icon = <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
//                         } else {
//                           badgeClass = "bg-gray-50 text-gray-600 dark:bg-zinc-900/40 dark:text-zinc-400 border-gray-100 dark:border-zinc-900";
//                           icon = <Info className="w-3.5 h-3.5 text-gray-500" />;
//                         }

//                         return (
//                           <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3.5">
                           
//                             <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:gap-1 font-sans text-[10px] text-zinc-400 dark:text-zinc-600 w-16">
//                               {icon}
//                               <span className="font-semibold">Line {issue.line}</span>
//                             </div>

//                             {/* Issue details */}
//                             <div className="flex-1 space-y-1.5">
//                               <span className={`inline-flex items-center text-[10px] font-bold font-sans tracking-wide uppercase px-2 py-0.5 rounded border ${badgeClass}`}>
//                                 {issue.severity}
//                               </span>
//                               <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
//                                 {issue.message}
//                               </p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                   </div>
//             </>
//           )}
//         </div>

//         {/* Right column: Scan History Side Panel */}
//         <div className="lg:col-span-1 border border-gray-100 dark:border-zinc-900 rounded-lg p-4 bg-gray-50/20 dark:bg-zinc-950/25 space-y-4">
//           <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-zinc-900">
//             <History className="w-4 h-4 text-zinc-400" />
//             <h3 className="text-xs font-bold tracking-tight uppercase font-sans text-zinc-500 dark:text-zinc-400">
//               Report History ({scanHistory.length})
//             </h3>
//           </div>

//           <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
//             {scanHistory.length === 0 ? (
//               <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
//                 <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
//                 <p className="text-[10px] italic leading-relaxed">
//                   No historical reports available. Trigger a scan above to start logs.
//                 </p>
//               </div>
//             ) : (
//               scanHistory.map((historyItem) => {
//                 const isActive = scanResult && (scanResult._id === historyItem._id || scanResult.createdAt === historyItem.createdAt);
//                 const itemDate = new Date(historyItem.createdAt);
                
//                 // Color ring based on score
//                 let scoreColor = "border-red-500 text-red-600 dark:text-red-400";
//                 if (historyItem.score >= 85) {
//                   scoreColor = "border-green-500 text-green-600 dark:text-green-400";
//                 } else if (historyItem.score >= 70) {
//                   scoreColor = "border-yellow-500 text-yellow-600 dark:text-yellow-400";
//                 }

//                 return (
//                   <motion.button
//                     whileHover={{ scale: 1.01, x: 2 }}
//                     whileTap={{ scale: 0.99 }}
//                     key={historyItem._id || historyItem.createdAt}
//                     onClick={() => onSelectHistoricalScan(historyItem)}
//                     className={`w-full text-left p-3 rounded border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
//                       isActive
//                         ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/15"
//                         : "border-gray-100 dark:border-zinc-900 hover:border-gray-300 dark:hover:border-zinc-800 bg-white dark:bg-zinc-900/50"
//                     }`}
//                   >
//                     <div className="space-y-1 overflow-hidden min-w-0 flex-1">
//                       <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-sans">
//                         <Clock className="w-3 h-3" />
//                         <span>{formatTimeAgo(historyItem.createdAt)}</span>
//                       </div>
//                       <p className="font-semibold text-[10px] font-sans truncate text-zinc-700 dark:text-zinc-300" title={itemDate.toLocaleString()}>
//                         {itemDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {itemDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
//                       </p>
//                       <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-sans">
//                         {historyItem.issues ? historyItem.issues.length : 0} detected issues
//                       </div>
//                     </div>

//                     {/* Circular Score display */}
//                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold font-sans text-[10px] shrink-0 ${scoreColor}`}>
//                       {historyItem.score}
//                     </div>
//                   </motion.button>
//                 );
//               })
//             )}
//           </div>
//         </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, AlertOctagon, Info, FileCode, CheckCircle2, RefreshCw, Clock, History } from "lucide-react";
import { motion } from "motion/react";

export default function ScanView({
  scanResult,
  isScanning,
  onTriggerScan,
  scanHistory = [],
  onSelectHistoricalScan,
}) {
  // Store which file sections are currently expanded
  const [expandedFiles, setExpandedFiles] = useState({});

  const toggleFile = (filename) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [filename]: !prev[filename],
    }));
  };

  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (isScanning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white dark:bg-black transition-colors duration-300 font-sans">
        <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin mb-6" />
        <h3 className="text-sm font-bold tracking-tight mb-2">Analyzing Repository Files...</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm text-center">
          Gemini 1.5 Flash is inspecting your imports, syntax, hardcoded credentials, and error safety. This takes a few moments.
        </p>
      </div>
    );
  }

  // Pre-process active report if it exists
  let issuesByFile = {};
  let errorsCount = 0;
  let warningsCount = 0;
  let infoCount = 0;
  let score = 100;
  let circumference = 0;
  let strokeDashoffset = 0;

  if (scanResult) {
    scanResult.issues.forEach((issue) => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });

    errorsCount = scanResult.issues.filter((i) => i.severity === "error").length;
    warningsCount = scanResult.issues.filter((i) => i.severity === "warning").length;
    infoCount = scanResult.issues.filter((i) => i.severity === "info").length;

    score = scanResult.score;
    const radius = 50;
    circumference = 2 * Math.PI * radius;
    strokeDashoffset = circumference - (score / 100) * circumference;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans">
      {/* Header Block with Rescan Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-900 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Code Security & Health Scan</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit dependencies, verify syntax, identify vulnerabilities, and monitor overall quality standards.
          </p>
        </div>
        {scanResult && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTriggerScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rescan Codebase
          </motion.button>
        )}
      </div>

      {/* Main Grid: Left side Active Report, Right side History Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Active Scan Content */}
        <div className="lg:col-span-3 space-y-6">
          {!scanResult ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-100 dark:border-zinc-900 rounded-lg bg-gray-50/10 dark:bg-zinc-950/5">
              <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded flex items-center justify-center mb-4">
                <FileCode className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-sm font-bold tracking-tight mb-1">No Scan History Loaded</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">
                Launch a deep scan to evaluate code security, quality standards, and overall repository health.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                id="trigger-first-scan-btn"
                onClick={onTriggerScan}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded transition-all shadow-sm cursor-pointer"
              >
                Scan Codebase Now
              </motion.button>
            </div>
          ) : (
            <>
              {/* Score and Overview Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-6 rounded-lg">
                {/* Health score circle */}
                <div className="flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-zinc-900 md:col-span-1">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-gray-100 dark:stroke-zinc-900 fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black tracking-tighter">{score}</span>
                      <span className="text-[10px] block font-serif text-zinc-400 uppercase">Health Score</span>
                    </div>
                  </div>
                </div>

                {/* Issue counters */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Active Scan Report</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Completed on: {new Date(scanResult.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                      <div className="text-xs">
                        <span className="font-bold">{errorsCount}</span> <span className="text-zinc-500">Errors</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="text-xs">
                        <span className="font-bold">{warningsCount}</span> <span className="text-zinc-500">Warnings</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-3 py-2 rounded">
                      <div className="w-2 h-2 rounded-full bg-zinc-400" />
                      <div className="text-xs">
                        <span className="font-bold">{infoCount}</span> <span className="text-zinc-500">Info</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-500">
                  Detected Vulnerabilities & Code Smells ({scanResult.issues.length})
                </h3>

                {scanResult.issues.length === 0 ? (
                  <div className="border border-green-100 dark:border-zinc-900 bg-green-50/20 dark:bg-zinc-950/20 p-8 rounded-lg text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                    <h4 className="text-sm font-bold text-green-700 dark:text-green-500">Perfect Health!</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                      No structural defects, vulnerabilities, or bad habits were identified in your repository.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(issuesByFile).map(([filename, issues]) => {
                      const isCollapsed = expandedFiles[filename] === false;
                      return (
                        <div
                          key={filename}
                          className="border border-gray-100 dark:border-zinc-900 rounded bg-white dark:bg-zinc-950 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFile(filename)}
                            className="w-full text-left p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-50 dark:border-zinc-900 flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-zinc-900/80 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-zinc-400" />
                              <span className="text-xs font-semibold font-sans tracking-tight text-zinc-700 dark:text-white">
                                {filename}
                              </span>
                              <span className="text-[10px] font-sans text-zinc-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                                {issues.length} {issues.length === 1 ? "issue" : "issues"}
                              </span>
                            </div>
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>

                          {!isCollapsed && (
                            <div className="divide-y divide-gray-50 dark:divide-zinc-900">
                              {issues.map((issue, index) => {
                                let badgeClass = "";
                                let icon = null;
                                if (issue.severity === "error") {
                                  badgeClass = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500 border-red-100 dark:border-red-950";
                                  icon = <AlertOctagon className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />;
                                } else if (issue.severity === "warning") {
                                  badgeClass = "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-500 border-yellow-100 dark:border-yellow-950";
                                  icon = <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
                                } else {
                                  badgeClass = "bg-gray-50 text-gray-600 dark:bg-zinc-900/40 dark:text-zinc-400 border-gray-100 dark:border-zinc-900";
                                  icon = <Info className="w-3.5 h-3.5 text-gray-500" />;
                                }

                                return (
                                  <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3.5">
                                    <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:gap-1 font-sans text-[10px] text-zinc-400 dark:text-zinc-600 w-16">
                                      {icon}
                                      <span className="text-zinc-500 font-sans font-semibold">Line {issue.line}</span>
                                    </div>

                                    <div className="flex-1 space-y-1.5">
                                      <span className={`inline-flex items-center text-[10px] font-bold font-sans tracking-wide uppercase px-2 py-0.5 rounded border ${badgeClass}`}>
                                        {issue.severity}
                                      </span>
                                      <p className="text-xs text-zinc-800 font-funnel dark:text-zinc-400 leading-relaxed">
                                        {issue.message}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right column: Scan History Side Panel */}
        <div className="lg:col-span-1 border border-gray-100 dark:border-zinc-900 rounded-lg p-4 bg-gray-50/20 dark:bg-zinc-950/25 space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-zinc-900">
            <History className="w-4 h-4 text-zinc-600" />
            <h3 className="text-xs font-bold tracking-tight uppercase font-sans text-zinc-800 dark:text-zinc-400">
              Report History ({scanHistory.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {scanHistory.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="text-[10px] italic leading-relaxed">
                  No historical reports available. Trigger a scan above to start logs.
                </p>
              </div>
            ) : (
              scanHistory.map((historyItem) => {
                const isActive = scanResult && (scanResult._id === historyItem._id || scanResult.createdAt === historyItem.createdAt);
                const itemDate = new Date(historyItem.createdAt);
                
                // Color ring based on score
                let scoreColor = "border-red-500 text-red-600 dark:text-red-400";
                if (historyItem.score >= 85) {
                  scoreColor = "border-green-500 text-green-600 dark:text-green-400";
                } else if (historyItem.score >= 70) {
                  scoreColor = "border-yellow-500 text-yellow-600 dark:text-yellow-400";
                }

                return (
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    key={historyItem._id || historyItem.createdAt}
                    onClick={() => onSelectHistoricalScan(historyItem)}
                    className={`w-full text-left p-3 rounded border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/15"
                        : "border-gray-100 dark:border-zinc-900 hover:border-gray-300 dark:hover:border-zinc-800 bg-white dark:bg-zinc-900/50"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-sans">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(historyItem.createdAt)}</span>
                      </div>
                      <p className="font-semibold text-[10px] font-sans truncate text-zinc-700 dark:text-zinc-300" title={itemDate.toLocaleString()}>
                        {itemDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {itemDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div className="text-[9px] text-zinc-600 dark:text-zinc-400 font-sans">
                        {historyItem.issues ? historyItem.issues.length : 0} detected issues
                      </div>
                    </div>

                    {/* Circular Score display */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold font-sans text-[10px] shrink-0 ${scoreColor}`}>
                      {historyItem.score}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
