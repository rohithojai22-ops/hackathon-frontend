/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1e40af",      // primary
          blueDark: "#1e3a8a",  // hover
          orange: "#f97316",    // accent
        },
      },
      boxShadow: {
        card: "0 8px 28px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
