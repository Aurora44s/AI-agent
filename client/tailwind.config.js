/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3b82f6 0%, #6366f1 30%, #a855f7 60%, #ec4899 100%)",
        "gradient-primary-r": "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)",
        "gradient-soft": "linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)",
        "gradient-cool": "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
        "gradient-warm": "linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)",
      },
      boxShadow: {
        "colored-sm": "0 1px 3px 0 rgba(59, 130, 246, 0.1)",
        "colored-md": "0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -2px rgba(59, 130, 246, 0.1)",
        "colored-lg": "0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
      },
      animation: {
        "shimmer": "shimmer 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "200% 0" },
          "50%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
