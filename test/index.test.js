/* global describe, it */

import { expect } from 'chai'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import multiEntry from 'rollup-plugin-multi-entry'

import { buildAsset } from '../src/helpers.js'
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

  it('handles unusual output directories', function() {
    return rollup({
      input: {
        entry1: 'test/demo/entry1.js',
        'sub/entry2': 'test/demo/entry2.js'
      },
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
          fileName: 'sub/entry2.js.flow',
          isAsset: true,
          source: "// @flow\n\nexport * from '../entry2.js'\n"
        })
      })
  })

  it('handles types string configuration', function() {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [
        flowEntry({ types: 'test/demo/types/entry.js.flow' }),
        babel(babelOpts)
      ]
    })
      .then(bundle => bundle.generate({ dir: 'test/tmp/', format: 'cjs' }))
      .then(({ output }) => {
        expect(output).has.lengthOf(5)
        expect(output).to.deep.include({
          fileName: 'entry1.js.flow',
          isAsset: true,
          source:
            "// @flow\n\nexport { default } from '../demo/types/entry.js.flow'\nexport * from '../demo/types/entry.js.flow'\n"
        })
        expect(output).to.deep.include({
          fileName: 'entry2.js.flow',
          isAsset: true,
          source:
            "// @flow\n\nexport { default } from '../demo/types/entry.js.flow'\nexport * from '../demo/types/entry.js.flow'\n"
        })
      })
  })

  it('handles types object configuration', function() {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [
        flowEntry({
          types: {
            'entry1.js': 'test/demo/types/entry.js.flow',
            'entry2.js': false,
            'entry3.js': 'test/types/imaginary.js'
          }
        }),
        babel(babelOpts)
      ]
    })
      .then(bundle => bundle.generate({ dir: 'test/tmp/', format: 'cjs' }))
      .then(({ output }) => {
        expect(output).has.lengthOf(4)
        expect(output).to.deep.include({
          fileName: 'entry1.js.flow',
          isAsset: true,
          source:
            "// @flow\n\nexport { default } from '../demo/types/entry.js.flow'\nexport * from '../demo/types/entry.js.flow'\n"
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

describe('buildEntry', function() {
  it('handles difficult paths', function() {
    const entry = {
      fileName: 'sub/index.js.flow',
      input: [
        '/home/someone/sub/bare.js',
        '/home/someone/windows\\style.js',
        "/home/some'quotes'in/here.js"
      ]
    }

    expect(buildAsset('/home/someone', entry, 'semi-strict')).deep.equals({
      fileName: 'sub/index.js.flow',
      isAsset: true,
      source:
        '// @flow semi-strict\n\n' +
        "export * from './bare.js'\n" +
        "export * from '../windows/style.js'\n" +
        "export * from '../../some\\'quotes\\'in/here.js'\n"
    })
  })
})
