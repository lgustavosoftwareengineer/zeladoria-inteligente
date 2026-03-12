import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "loading-dot": {
          "0%, 100%": { opacity: "0" },
          "33%": { opacity: "1" },
          "66%": { opacity: "0" },
        },
      },
      animation: {
        "loading-dot": "loading-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

export default config
