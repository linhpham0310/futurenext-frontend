module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/immutability': 'off',
      },
    },
  ],
};
