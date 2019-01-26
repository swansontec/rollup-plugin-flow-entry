import fs from 'fs'
import { promise as matched } from 'matched'
import path from 'path'

function mkdir (nativePath) {
  return new Promise((resolve, reject) =>
    fs.mkdir(nativePath, void 0, err =>
      err != null && err.code !== 'EEXIST' ? reject(err) : resolve()
    )
  )
}

function writeFile (nativePath, data, opts) {
  return new Promise((resolve, reject) =>
    fs.writeFile(nativePath, data, opts, (err, out) =>
      err != null ? reject(err) : resolve(out)
    )
  )
}

/**
 * Recursively creates a directory.
 */
function deepMkdir (nativePath) {
  return mkdir(nativePath).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(path.dirname(nativePath)).then(() => mkdir(nativePath))
  })
}

/**
 * Writes a file, creating its directory if needed.
 */
function deepWriteFile (nativePath, data, opts) {
  return writeFile(nativePath, data, opts).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(path.dirname(nativePath)).then(() =>
      writeFile(nativePath, data, opts)
    )
  })
}

function arrayify (input) {
  return Array.isArray(input) ? input : input != null ? [input] : []
}

function resolveInputs (input) {
  // rollup-plugin-mulit-entry allows an object as input:
  if (input && (input.include || input.exclude)) {
    const patterns = arrayify(input.include).concat(
      arrayify(input.exclude).map(pattern => '!' + pattern)
    )
    return matched(patterns, { realpath: true })
  }

  return matched(arrayify(input), { realpath: true })
}

export default function flowEntry () {
  let savedInput

  return {
    name: 'rollup-plugin-flow-entry',

    options (opts) {
      savedInput = opts.input
    },

    generateBundle (opts, bundle) {
      if (!savedInput) return
      if (typeof savedInput === 'string' && savedInput.charCodeAt(0) === 0) {
        throw new Error(
          'Please include rollup-plugin-flow-entry before rollup-plugin-multi-entry in the plugins list'
        )
      }

      const flowPath = path.resolve(opts.file + '.flow')
      const outputDir = path.dirname(flowPath)

      return resolveInputs(savedInput).then(inputs => {
        let code = '// @flow\n\n'
        for (const input of inputs) {
          const inputPath = path.relative(outputDir, path.resolve(input))
          const escaped = inputPath.replace(/\\+/g, '/')
          code += `export * from '${escaped}'\n`
        }

        return deepWriteFile(flowPath, code, 'utf8')
      })
    }
  }
}
