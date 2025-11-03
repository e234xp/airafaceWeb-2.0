module.exports = {
  root: false,
  env: {
    node: false,
  },
  extends: [
    'plugin:vue/strongly-recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'eqeqeq': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'no-underscore-dangle': ['error', {
      allow: [
        '_children',
        '_id', '_XID'
        , '_STATUS_NONE', '_STATUS_SHOW_ON_TIME', '_STATUS_LEAVE_ON_TIME', '_STATUS_LATE', '_STATUS_EARLY', '_STATUS_NO_SHOW'
      ]
    }],
    'max-len': ["error", { "code": 170, "ignoreComments": true, "ignoreTemplateLiterals": true, "ignoreStrings": true }],
    'operator-linebreak': 'off',
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],

    // 'prefer-template': 'error',
    'no-await-in-loop': 'off',
    'no-extend-native': ['error', { 'exceptions': ['Object'] }],
    // 'no-eval': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'warn',
  }
};
