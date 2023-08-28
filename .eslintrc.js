module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'semi': ['error', 'never'],
    'curly': ['error', 'multi-line'],
    'object-curly-spacing': ['error', 'always'],
    'dot-notation': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-unused-vars': [
      'warn', {
        'vars': 'all',
        'args': 'none',
        'ignoreRestSiblings': false,
      }],
    'prettier/prettier': 'off',
    'no-console': 'off',
  },
  ignorePatterns: ['dist/'],
}
