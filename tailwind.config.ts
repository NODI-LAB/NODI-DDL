import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f6f2",
        line: "#dfddd5",
        nodi: {
          green: "#146c5c",
          gold: "#b77719",
          red: "#b3322a",
          blue: "#2863a6"
        }
      },
      boxShadow: {
        soft: "0 12px 28px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
