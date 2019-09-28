/* global describe, it */

import { expect } from 'chai'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import multiEntry from 'rollup-plugin-multi-entry'

import flowEntry from '../src/index.js'

const babelOpts = {
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-flow']
}

describe('rollup-plugin-flow-entry', function() {
  it('handles single entry point', function() {
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

  it('handles single entry point in strict mode', function() {
    return rollup({
      input: 'test/demo/entry1.js',
      plugins: [flowEntry({ mode: 'strict' }), babel(babelOpts)]
    })
      .then(bundle =>
        bundle.generate({ file: 'test/tmp/output.js', format: 'cjs' })
      )
      .then(({ output }) => {
        expect(output).has.lengthOf(2)
        expect(output).to.deep.include({
          fileName: 'output.js.flow',
          isAsset: true,
          source: "// @flow strict\n\nexport * from '../demo/entry1.js'\n"
        })
      })
  })

  it('handles multiple entry points', function() {
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

  it('handles input & output in the same directory', function() {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [flowEntry(), babel(babelOpts)]
    })
      .then(bundle => bundle.generate({ dir: 'test/demo/', format: 'cjs' }))
      .then(({ output }) => {
        expect(output).has.lengthOf(5)
        expect(output).to.deep.include({
          fileName: 'entry1.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from './entry1.js'\n"
        })
        expect(output).to.deep.include({
          fileName: 'entry2.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from './entry2.js'\n"
        })
      })
  })

  it('works with rollup-plugin-multi-entry', function() {
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

  it('works with rollup-plugin-multi-entry in strict mode', function() {
    return rollup({
      input: 'test/demo/entry*.js',
      plugins: [flowEntry({ mode: 'strict' }), multiEntry(), babel(babelOpts)]
    })
      .then(bundle =>
        bundle.generate({ file: 'test/tmp/output.js', format: 'cjs' })
      )
      .then(({ output }) => {
        const expected =
          '// @flow strict\n\n' +
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
