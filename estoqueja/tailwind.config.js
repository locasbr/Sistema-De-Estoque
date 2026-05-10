/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sora)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink:    { DEFAULT: '#16130f', 2: '#3a3630', 3: '#7a766f', 4: '#b8b3aa' },
        paper:  { DEFAULT: '#faf8f5', 2: '#f2ede6', 3: '#e8e2d8' },
        brand:  { DEFAULT: '#d97706', light: '#fef3c7', dark: '#92400e' },
        danger: { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#991b1b' },
        success:{ DEFAULT: '#16a34a', light: '#dcfce7', dark: '#166534' },
        warn:   { DEFAULT: '#d97706', light: '#fef3c7', dark: '#92400e' },
      },
    },
  },
  plugins: [],
}
