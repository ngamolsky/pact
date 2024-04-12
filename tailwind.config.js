import formsPlugin from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        antic: ["Antic", "sans-serif"],
      },
      colors: {
        gradientStart: "#4C77FA",
        gradientEnd: "#11B4D2",
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(to bottom, #4C77FA, #11B4D2)",
      },
    },
  },
  plugins: [formsPlugin],
};
