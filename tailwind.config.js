module.exports = {
  mode: "jit",
  purge: [
    "./layout/**/*.liquid",
    "./sections/**/*.liquid",
    "./templates/**/*.liquid",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
