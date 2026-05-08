// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    //  Đảm bảo bao gồm tất cả các file trong 'src/app' nơi bạn sẽ viết JSX/TSX
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    //  Đảm bảo bao gồm tất cả các file trong 'src/components'
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    //  Dòng './src/pages/**/*.{js,ts,jsx,tsx,mdx}' có thể xóa nếu bạn chỉ dùng App Router
  ],
  theme: {
    extend: {
      // --- (Tùy chọn) Thêm các tùy chỉnh theme sau này ---
      // Ví dụ:
      // colors: {
      //   primary: '#...',
      //   secondary: '#...',
      // },
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
    },
  },
  plugins: [], // Thêm các plugin Tailwind (vd: @tailwindcss/forms) sau này nếu cần
};
export default config;
