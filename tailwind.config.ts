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
        // ── Azul Petróleo (cor primária — autoridade, confiança) ──────────────
        petroleo: {
          50:  "#EBF4F8",
          100: "#C8E3ED",
          200: "#91C6DA",
          300: "#5AA9C8",
          400: "#2E8FB5",
          500: "#1A6B8A",   // principal
          600: "#155974",
          700: "#0F455C",
          800: "#0B3244",
          900: "#061E2B",
        },
        // ── Verde Água (cor secundária — leveza, suporte, crescimento) ────────
        agua: {
          50:  "#E6F7F4",
          100: "#BFECE4",
          200: "#80D9C9",
          300: "#40C6AE",
          400: "#1DB39A",
          500: "#16A085",   // principal
          600: "#12876F",
          700: "#0D6B58",
          800: "#095040",
          900: "#053529",
        },
        // ── Aliases convenientes ──────────────────────────────────────────────
        brand: {
          50:  "#EBF4F8",
          100: "#C8E3ED",
          200: "#91C6DA",
          300: "#5AA9C8",
          400: "#2E8FB5",
          500: "#1A6B8A",
          600: "#155974",
          700: "#0F455C",
          800: "#0B3244",
          900: "#061E2B",
        },
        accent: {
          50:  "#E6F7F4",
          100: "#BFECE4",
          200: "#80D9C9",
          300: "#40C6AE",
          400: "#1DB39A",
          500: "#16A085",
          600: "#12876F",
          700: "#0D6B58",
        },
        success: "#16A085",
        warning: "#D97706",
        danger:  "#DC2626",
      },
      fontFamily: {
        // Fonte principal do logotipo (MEIguia) — via CSS var do next/font
        logo:    ["var(--font-montserrat)", "sans-serif"],
        // Fonte do subtítulo "Portal" — via CSS var do next/font
        portal:  ["var(--font-raleway)", "sans-serif"],
        // Fonte de interface (corpo, UI) — via CSS var do next/font
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Pesos tipográficos explícitos para o logotipo
      fontWeight: {
        thin:       "100",
        extralight: "200",
        light:      "300",
        normal:     "400",
        medium:     "500",
        semibold:   "600",
        bold:       "700",
        extrabold:  "800",
        black:      "900",
      },
    },
  },
  plugins: [],
};

export default config;
