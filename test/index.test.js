/* global describe, it */

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
  it('handles single entry point', function () {
    return rollup({
      input: 'test/demo/entry1.js',
      plugins: [flowEntry(), babel(babelOpts)]
    })
      .then(bundle =>
        bundle.generate({ file: 'test/tmp/output.js', format: 'cjs' })
      )
      .then(({ output }) => {
        expect(output).has.lengthOf(2)
        expect(output).to.deep.include({
          fileName: 'output.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from '../demo/entry1.js'\n"
        })
      })
  })

  it('handles multiple entry points', function () {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [flowEntry(), babel(babelOpts)]
    })
      .then(bundle => bundle.generate({ dir: 'test/tmp/', format: 'cjs' }))
      .then(({ output }) => {
        expect(output).has.lengthOf(5)
        expect(output).to.deep.include({
          fileName: 'entry1.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from '../demo/entry1.js'\n"
        })
        expect(output).to.deep.include({
          fileName: 'entry2.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from '../demo/entry2.js'\n"
        })
      })
  })

  it('works with rollup-plugin-multi-entry', function () {
    return rollup({
      input: 'test/demo/entry*.js',
      plugins: [flowEntry(), multiEntry(), babel(babelOpts)]
    })
      .then(bundle =>
        bundle.generate({ file: 'test/tmp/output.js', format: 'cjs' })
      )
      .then(({ output }) => {
        const expected =
          '// @flow\n\n' +
          "export * from '../demo/entry1.js'\n" +
          "export * from '../demo/entry2.js'\n"

        expect(output).has.lengthOf(2)
        expect(output).to.deep.include({
          fileName: 'output.js.flow',
          isAsset: true,
          source: expected
        })
      })
  })
})
