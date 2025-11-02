import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-bebas)", "system-ui", "sans-serif"],
      },
      colors: {
        // Theme colors
        order: {
          DEFAULT: "#3b82f6", // blue-500
          light: "#60a5fa", // blue-400
        },
        chaos: {
          DEFAULT: "#f59e0b", // amber-500
          light: "#fbbf24", // amber-400
          dark: "#d97706", // amber-600
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config