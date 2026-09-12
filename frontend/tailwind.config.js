/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: "#5A1F2F",
          "burgundy-dark": "#471825",
          cream: "#FAF6F0",
          "cream-light": "#FDFBF7",
          border: "#E8DCC8",
          text: "#2F2B27",
          muted: "#7C7267",
        },
        gold: {
          900: "#7A5E10",
          800: "#A07C1A",
          700: "#C49B24",
          600: "#D4AF37",
          500: "#E0C050",
          400: "#F0C846",
          300: "#F5D870",
          200: "#FAE89A",
          100: "#FDF5CC",
          50: "#FAF3E0",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Inter", "system-ui", "sans-serif"],
        klaristha: ["var(--font-klaristha)"],
        cormorant: ["var(--font-cormorant)"],
        romance: ["var(--font-modern-romance)"],
      },
      boxShadow: {
        "gold-sm": "0 1px 3px rgba(212,175,55,0.15)",
        "gold-md": "0 4px 12px rgba(212,175,55,0.2)",
        "gold-lg": "0 8px 24px rgba(212,175,55,0.25)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        pulse2: "pulse2 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse2: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
    },
  },
  plugins: [],
};
