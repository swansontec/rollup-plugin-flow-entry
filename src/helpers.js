import path from 'path'

/**
 * Formats an output file, which re-exports items from a list of paths.
 */
export function buildAsset(outDir, flowEntry, mode) {
  const { fileName, input } = flowEntry

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
  if (typeof input === 'string') {
    source += `export * from '${escapePath(input)}'\n`
  } else {
    for (let i = 0; i < input.length; ++i) {
      source += `export * from '${escapePath(input[i])}'\n`
    }
  }

  return { fileName, isAsset: true, source }
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
