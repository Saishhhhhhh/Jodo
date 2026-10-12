// Force tailwind rebuild
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        taupe: "#C5B09A",
        "taupe-dark": "#A8937D",
        "taupe-light": "#DDD0C4",
        gold: "#C9A46A",
        "gold-dark": "#B08940",
        terracotta: "#C85A3C",
        "jodo-dark": "#1C1A17",
        "jodo-teal": "#3D7A8A",
        cream: "#FAF6F1",
      },
      fontFamily: {
        sans: ["'DM Sans'", "var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        dmsans: ["'DM Sans'", "var(--font-dm-sans)", "sans-serif"],
        menu: ["'DM Sans'", "var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["'Syne'", "var(--font-syne)", "'DM Sans'", "system-ui", "sans-serif"],
        serif: ["'DM Sans'", "var(--font-dm-sans)", "sans-serif"],
        mono: ["'Space Grotesk'", "monospace"],
      },
      fontSize: {
        "hero": ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.05", fontWeight: "700" }],
      },
      borderRadius: {
        "hero": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
