module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // tích hợp Prettier, tắt rule ESLint xung đột
  ],
  rules: {
    // cho phép any toàn project (hoặc bạn có thể để "warn")
    //'@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
