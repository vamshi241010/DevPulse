import { motion } from "motion/react";

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-xl p-8 text-left transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:border-gray-300 dark:hover:border-zinc-700 overflow-hidden"
    >
      {/* Decorative gradient radial accent behind the card */}
      <div className="absolute inset-0 bg-radial from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Icon frame with smooth hover scale */}
      <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-6 h-6 text-blue-600 transition-colors duration-300 group-hover:text-blue-500" />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom sliding underline effect */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-blue-600 dark:bg-blue-500 w-0 group-hover:w-full transition-all duration-300" />
    </motion.div>
  );
}
