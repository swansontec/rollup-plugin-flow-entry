import babel from 'rollup-plugin-babel'

import packageJson from './package.json'

const babelOpts = {
  babelrc: false,
  presets: ['es2015-rollup']
}

export default {
  external: ['fs', 'path', 'pify'],
  input: './src/index.js',
  output: { file: packageJson.main, format: 'cjs' },
  plugins: [babel(babelOpts)]
}
