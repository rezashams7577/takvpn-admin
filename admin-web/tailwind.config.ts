import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import sharedPreset from "@takvpn/shared/tailwind-preset";

const config: Config = {
  presets: [sharedPreset as Config],
  plugins: [typography],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
    },
  },
};
export default config;
