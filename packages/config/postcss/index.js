/**
 * Shared PostCSS config. Apps re-export it from their own `postcss.config.mjs`:
 *   export { default } from "@repo/config/postcss";
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
