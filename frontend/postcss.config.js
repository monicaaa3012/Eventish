// postcss.config.js (for Tailwind CSS v4+)
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// postcss.config.js

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
};