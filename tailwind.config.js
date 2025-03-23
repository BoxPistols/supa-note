/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // MUIとの互換性のために重要
  corePlugins: {
    preflight: false, // MUIのスタイルと競合しないようにpreflightを無効化
  },
  important: "#root", // Tailwindのスタイルが確実に適用されるようにする
};

/**
 * [tailwind css導入時のエラー（npx tailwindcss init -p）](https://zenn.dev/ashunar0/articles/335eda81e61536)
 * [【Tailwind CSS】チュートリアル & Vite*Vue3への導入手順 #Vue.js - Qiita](https://qiita.com/whopper1962/items/655cdf1b0718eb733466)
 */
