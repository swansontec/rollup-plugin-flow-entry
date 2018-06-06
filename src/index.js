import fs from 'fs'
import path from 'path'
import pify from 'pify'

export default function flowEntry () {
  let inputs

  return {
    name: 'rollup-plugin-flow-entry',

    options (opts) {
      if (typeof opts.input === 'string') inputs = [opts.input]
      else if (Array.isArray(opts.input)) inputs = opts.input
    },

    onwrite (opts) {
      if (!inputs) return

      const flowPath = path.resolve(opts.file + '.flow')
      const outputDir = path.dirname(flowPath)

      let code = '// @flow\n\n'
      for (const input of inputs) {
        const inputPath = path.relative(outputDir, path.resolve(input))
        const escaped = inputPath.replace(/\\+/g, '/')
        code += `export * from '${escaped}'\n`
      }

      return pify(fs.writeFile)(flowPath, code)
    }
  }
}
