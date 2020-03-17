import path from 'path'

/**
 * Formats an output file, which re-exports items from a list of paths.
 * @param {*} config the rollup-plugin-flow-entry config object.
 * @param {string} outDir the output directory.
 * @param {string} fileName the output file name.
 * @param {string[]} paths an array of absolute paths to export types from.
 */
export function buildEntry(config, outDir, fileName, paths) {
  const { mode, types } = config

  // Handle path overrides:
  if (typeof types === 'string') {
    paths = [types]
  } else if (Array.isArray(types)) {
    paths = types
  } else if (typeof types === 'object' && types != null) {
    const ourTypes = types[fileName]
    if (typeof ourTypes === 'string') {
      paths = [ourTypes]
    } else if (Array.isArray(ourTypes)) {
      paths = ourTypes
    } else if (ourTypes === false) {
      return
    }
  }

  // Set up the path resolution logic:
  const here = path.dirname(path.resolve(outDir, fileName))
  function escapePath(id) {
    const out = path
      .relative(here, id)
      .replace(/\\+/g, '/')
      .replace(/[']/g, "\\'")
    return /^[/.]/.test(out) ? out : `./${out}`
  }

  // Build the source code:
  let source = mode != null ? `// @flow ${mode}\n\n` : '// @flow\n\n'
  for (let i = 0; i < paths.length; ++i) {
    source += `export * from '${escapePath(paths[i])}'\n`
  }

  return { type: 'asset', fileName: fileName + '.flow', source }
}

/**
 * Extracts the original entry points from the mulit-entry output.
 * @param {string} outDir the output directory.
 */
export function parseMultiEntry(outDir, code) {
  const paths = []
  const lines = code.split('\n')
  for (const line of lines) {
    const quoted = line.replace(/^export \* from (".*");/, '$1')
    if (quoted === line) continue
    paths.push(path.resolve(outDir, JSON.parse(quoted)))
  }
  return paths
}
