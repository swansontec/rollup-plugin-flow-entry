import path from 'path'

const multiEntryId = '\0rollup-plugin-multi-entry:entry-point'

export default function flowEntry (config = {}) {
  const mode = config.mode ? ` ${config.mode}` : ''
  let savedMultiEntry

  return {
    name: 'rollup-plugin-flow-entry',

    transform (code, id) {
      // Capture the multi-entry point if it comes through:
      if (id === multiEntryId) savedMultiEntry = code
    },

    generateBundle (opts, bundle) {
      const outDir =
        opts.dir != null
          ? path.resolve(opts.dir)
          : path.dirname(path.resolve(opts.file))

      const locatePath = id => path.relative(outDir, path.resolve(id))
      const escapePath = id => {
        id = id.replace(/\\+/g, '/')
        return /^\./.test(id) ? id : `./${id}`
      }

      for (const n in bundle) {
        const file = bundle[n]
        if (file.isAsset || !file.isEntry || file.facadeModuleId == null) {
          continue
        }

        if (file.facadeModuleId !== multiEntryId) {
          // Normal files:
          const path = escapePath(locatePath(file.facadeModuleId))
          const source = `// @flow${mode}\n\nexport * from '${path}'\n`
          const fileName = file.fileName + '.flow'
          bundle[fileName] = { fileName, isAsset: true, source }
        } else {
          // rollup-plugin-multi-entry:
          if (savedMultiEntry == null || opts.file == null) {
            this.warn(
              'Unable to create Flow entry: rollup-plugin-multi-entry not configured correctly'
            )
            continue
          }

          let source = `// @flow${mode}\n\n`
          const lines = savedMultiEntry.split('\n')
          for (const line of lines) {
            const quoted = line.replace(/^export \* from (".*");/, '$1')
            if (quoted === line) continue
            const path = escapePath(locatePath(JSON.parse(quoted)))
            source += `export * from '${path}'\n`
          }

          const fileName = locatePath(opts.file + '.flow')
          bundle[fileName] = { fileName, isAsset: true, source }
        }
      }
    }
  }
}
