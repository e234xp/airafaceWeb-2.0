module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/strongly-recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'no-underscore-dangle': ['error', {
      allow: [
        '_id', '_XID'
        , '_STATUS_NONE', '_STATUS_SHOW_ON_TIME', '_STATUS_LEAVE_ON_TIME', '_STATUS_LATE', '_STATUS_EARLY', '_STATUS_NO_SHOW'
      ]
    }],
    'max-len': ["error", { "code": 170, "ignoreComments": true, "ignoreTemplateLiterals": true }],

    // 'prefer-template': 'error',
    'no-await-in-loop': 'off',
    'no-extend-native': ['error', { 'exceptions': ['Object'] }],
    // 'no-eval': 'error',
    'no-unused-vars': 'error',
  }
};
