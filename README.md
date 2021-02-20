# rollup-plugin-flow-entry

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.com/swansontec/rollup-plugin-flow-entry.svg?branch=master)](https://travis-ci.com/swansontec/rollup-plugin-flow-entry)

If you are writing a library using the [Flow type system](https://flow.org/), you might want to make your library's types available to your end users. One way to do this is to place a file with a `.js.flow` extension alongside your bundled source code. Flow knows to look inside files like this for type information.

This Rollup plugin will create one of these `.js.flow` files alongside each of your output files. The `.js.flow` file will simply `export *` from your un-bundled input file, allowing Flow to find your original type information.

## Usage

Here is an example `rollup.config.js` file using this plugin:

```js
import flowEntry from 'rollup-plugin-flow-entry'

export default {
  input: 'src/index.js',
  output: { file: 'lib/index.js', format: 'cjs' },
  plugins: [
    flowEntry()
    // You will also need rollup-plugin-babel or rollup-plugin-flow
    // in here to strip your type annotations...
  ]
}
```

This will produce a file called `lib/index.js.flow` alongside the normal `lib/index.js` output file. The output file will look like this:

```js
// @flow

export * from '../src/index.js'
```

## Flow Strict

If you want to enable stricter type checking, pass a `mode` into configuration options:

```js
export default {
  input: 'src/index.js',
  output: { file: 'lib/index.js', format: 'cjs' },
  plugins: [
    flowEntry({ mode: 'strict-local' })
    // Other plugins...
  ]
}
```

## Multiple Entry Points

If you use Rollup's built-in code splitting feature, this plugin will create one Flow entry point for each entry chunk.

This plugin can also detect when [@rollup/plugin-multi-entry](https://github.com/rollup/plugins/tree/master/packages/multi-entry) is being used, and will create a single combined Flow entry point when appropriate.

## Customizing Source Locations

By default `rollup-plugin-flow-entry` will link each output file back to its original source file (if one exists). If you want to change this behavior, though, you can pass a `types` option to the plugin, which will replace the original source location.

This is useful if your library is written in TypeScript, for example, but you would still like to ship Flow types. Just put your Flow type definitions somewhere in your source directory, and then use the `types` option to link back to the Flow types instead of your original TypeScript source code:

```js
export default {
  input: 'src/index.ts',
  output: { file: 'lib/index.js', format: 'cjs' },
  plugins: [
    flowEntry({ types: 'src/flow-types.js', })
    // Other plugins for TypeScript support...
  ]
}

```

If you have multiple entry points, you can pass an object for `types` to customize each output file individually:

```js
flowEntry({
  types: {
    'index.js': 'src/flow-types.js',
    'skip.js': false
  }
})
```

The output filename goes on the left, and the source filename goes on the right. Passing `false` will skip that output file entirely.
