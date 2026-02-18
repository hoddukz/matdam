// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        matdam: {
          dark: "#2C2417",
          gold: "#D4A035",
          brown: "#6B5B3E",
          cream: "#FAF6EF",
        },
      },
      fontFamily: {
        "heading-ko": ['"Noto Serif KR"', "serif"],
        "body-ko": ['"Noto Sans KR"', "sans-serif"],
        "body-en": ['"DM Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
