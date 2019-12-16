module.exports = {
  root: true, // 指定根路径
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module', // ECMAScript 模块
    ecmaVersion: 2017 // ECMAScript 版本
  },
  env: {
    browser: true, // 浏览器启用
    node: true, // node启用
    es6: true // es6启用
  },
  extends: [
    'eslint:recommended',
    'standard' // js标准规则
    // https://standardjs.com/rules-zhcn.html#javascript-standard-style
  ],
  // add your custom rules here
  rules: {
    'no-console': 0, // 允许 console
    indent: ['error', 2], // 缩进宽度2个空格
    'comma-dangle': 'off', // 允许行末逗号
    'no-constant-condition': 'off', // 允许常量作为表达式条件
    'no-delete-var': 'off', // 允许使用 delete
    'no-extend-native': 'off', // 允许扩展原生对象
    'no-floating-decimal': 'off', //  允许省去小数点前的0
    'no-multi-str': 'off', // 允许多行字符串
    semi: 2, // 不使用分号
    'generator-star-spacing': 'off', // 关闭
    // 最大长度 120
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true
      }
    ],
    // 最大行数 500
    'max-lines': [
      'warn',
      {
        max: 500,
        skipBlankLines: true,
        skipComments: true
      }
    ],
    // 要求使用 let 或 const 而不是 var
    'no-var': ['error'],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: 'off',
    'prefer-promise-reject-errors': 'off',
    'node/no-deprecated-api': 'off',
    'no-case-declarations': 'off',
    'no-new-func': 'off',
    'no-new': 'off',
    'no-proto': 'off',
    'no-prototype-builtins': 'off'
  },
  globals: {
  }
}
