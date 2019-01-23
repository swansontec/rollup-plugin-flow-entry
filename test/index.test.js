const fs = require('fs')
const process = require('process')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const multiEntry = require('rollup-plugin-multi-entry')

const flowEntry = require('../lib/index.js')

const expected =
  '// @flow\n\n' +
  "export * from '../demo1.js'\n" +
  "export * from '../demo2.js'\n"

const babelOpts = {
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-flow']
}

// No testing framework needed!
// Just run Rollup and compare the output with what we expect:
rollup({
  input: 'test/demo*.js',
  plugins: [flowEntry(), multiEntry(), babel(babelOpts)]
})
  .then(bundle => bundle.write({ file: 'test/tmp/demo.js', format: 'cjs' }))
  .then(() => {
    const text = fs.readFileSync('test/tmp/demo.js.flow', 'utf8')
    if (text !== expected) {
      console.error('Error: Output file does not match: ' + text)
      process.exit(1)
    }
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
