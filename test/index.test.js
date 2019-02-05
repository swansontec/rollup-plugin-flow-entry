/* global describe, it */

const fs = require('fs')

const { expect } = require('chai')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const multiEntry = require('rollup-plugin-multi-entry')

const flowEntry = require('../lib/index.js')

const babelOpts = {
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-flow']
}

describe('rollup-plugin-flow-entry', function () {
  it('works with rollup-plugin-multi-entry', function () {
    return rollup({
      input: 'test/demo/entry*.js',
      plugins: [flowEntry(), multiEntry(), babel(babelOpts)]
    })
      .then(bundle => bundle.write({ file: 'test/tmp/demo.js', format: 'cjs' }))
      .then(() => {
        const expected =
          '// @flow\n\n' +
          "export * from '../demo/entry1.js'\n" +
          "export * from '../demo/entry2.js'\n"
        const text = fs.readFileSync('test/tmp/demo.js.flow', 'utf8')
        expect(text).equals(expected)
      })
  })
})
