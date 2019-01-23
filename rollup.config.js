import babel from 'rollup-plugin-babel'

import packageJson from './package.json'

const babelOpts = {
  babelrc: false,
  presets: ['@babel/preset-env']
}

const external = [...Object.keys(packageJson.dependencies), 'fs', 'path']

export default {
  external,
  input: './src/index.js',
  output: { file: packageJson.main, format: 'cjs', sourcemap: true },
  plugins: [babel(babelOpts)]
}
