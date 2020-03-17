/* global describe, it */

import { expect } from 'chai'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import multiEntry from 'rollup-plugin-multi-entry'

import { buildEntry } from '../src/helpers.js'
import flowEntry from '../src/index.js'

const babelOpts = {
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-flow']
}

function getSource(output, fileName) {
  const file = output.find(file => file.fileName === fileName)
  if (file == null || file.type !== 'asset') return
  return file.source
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
        expect(getSource(output, 'output.js.flow')).equals(
          "// @flow\n\nexport * from '../demo/entry1.js'\n"
        )
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
        expect(getSource(output, 'output.js.flow')).equals(
          "// @flow strict\n\nexport * from '../demo/entry1.js'\n"
        )
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
        expect(getSource(output, 'entry1.js.flow')).equals(
          "// @flow\n\nexport * from '../demo/entry1.js'\n"
        )
        expect(getSource(output, 'entry2.js.flow')).equals(
          "// @flow\n\nexport * from '../demo/entry2.js'\n"
        )
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
        expect(getSource(output, 'entry1.js.flow')).equals(
          "// @flow\n\nexport * from './entry1.js'\n"
        )
        expect(getSource(output, 'sub/entry2.js.flow')).equals(
          "// @flow\n\nexport * from '../entry2.js'\n"
        )
      })
  })

  it('handles types string configuration', function() {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [
        flowEntry({ types: 'test/types/entry.js.flow' }),
        babel(babelOpts)
      ]
    })
      .then(bundle => bundle.generate({ dir: 'test/tmp/', format: 'cjs' }))
      .then(({ output }) => {
        expect(output).has.lengthOf(5)
        expect(getSource(output, 'entry1.js.flow')).equals(
          "// @flow\n\nexport * from '../types/entry.js.flow'\n"
        )
        expect(getSource(output, 'entry2.js.flow')).equals(
          "// @flow\n\nexport * from '../types/entry.js.flow'\n"
        )
      })
  })

  it('handles types object configuration', function() {
    return rollup({
      input: ['test/demo/entry1.js', 'test/demo/entry2.js'],
      plugins: [
        flowEntry({
          types: {
            'entry1.js': 'test/types/entry.js.flow',
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
        expect(getSource(output, 'entry1.js.flow')).equals(
          "// @flow\n\nexport * from '../types/entry.js.flow'\n"
        )
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
        expect(getSource(output, 'output.js.flow')).equals(expected)
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
        expect(getSource(output, 'output.js.flow')).equals(expected)
      })
  })
})

describe('buildEntry', function() {
  it('handles difficult paths', function() {
    const expected = {
      type: 'asset',
      fileName: 'sub/index.js.flow',
      source:
        '// @flow semi-strict\n\n' +
        "export * from './bare.js'\n" +
        "export * from '../windows/style.js'\n" +
        "export * from '../../some\\'quotes\\'in/here.js'\n"
    }

    const paths = [
      '/home/someone/sub/bare.js',
      '/home/someone/windows\\style.js',
      "/home/some'quotes'in/here.js"
    ]

    expect(
      buildEntry(
        { mode: 'semi-strict' },
        '/home/someone',
        'sub/index.js',
        paths
      )
    ).deep.equals(expected)
  })
})
