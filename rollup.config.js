const path = require('path')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const postcss = require('rollup-plugin-postcss')
const autoprefixer = require('autoprefixer')
const { terser } = require('rollup-plugin-terser')
const pkg = require('./package.json')
const _ = require('lodash')
const moment = require('moment')

const dir = path.resolve(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'docs')

const banner = () => {
  const content = () => _.template(`/**
 * <%= name %>
 * @version: v<%= version %> @timestamp: <%= timestamp %>
 * @author: <%= author %>
 */
`)({...pkg, timestamp: moment().format('YYYY-MM-DD HH:mm:ss')})

  return {
    name: 'banner',
    renderChunk: function (code) {
      return content() + code
    }
  }
}

module.exports = {
  input: path.resolve(__dirname, 'src/index.js'),
  output: {
    name: 'Swiper',
    dir,
    format: 'umd',
    entryFileNames: process.env.NODE_ENV === 'production' ? 'swiper.min.js' : 'swiper.js'
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      // runtimeHelpers: true
    }),
    postcss({
      extensions: ['.less'],
      minimize: true,
      extract: true,
      plugins: [
        autoprefixer
      ]
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      terser(),
      banner()
    ] : [])
  ]
}
