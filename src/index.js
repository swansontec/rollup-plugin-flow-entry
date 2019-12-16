import path from 'path'

import { parseMultiEntry, buildAsset } from './helpers.js'

const multiEntryId = '\0rollup-plugin-multi-entry:entry-point'

export default function flowEntry(config = {}) {
  let savedMultiEntry

  return {
    name: 'rollup-plugin-flow-entry',

    transform(code, id) {
      // Capture the multi-entry point if it comes through:
      if (id === multiEntryId) savedMultiEntry = code
    },

    generateBundle(opts, bundle) {
      const outDir = opts.dir != null ? opts.dir : path.dirname(opts.file)

      // A list of Flow entries we need to generate:
      const entries = []
      function pushFlowEntry(fileName, input) {
        const { types } = config
        if (typeof types === 'string') {
          input = path.resolve(types)
        } else if (Array.isArray(types)) {
          input = types.map(p => path.resolve(p))
        } else if (typeof types === 'object' && types != null) {
          const ourTypes = types[fileName]
          if (typeof ourTypes === 'string') {
            input = path.resolve(ourTypes)
          } else if (Array.isArray(ourTypes)) {
            input = ourTypes.map(p => path.resolve(p))
          } else if (ourTypes === false) {
            return
          }
        }
        entries.push({ fileName: fileName + '.flow', input })
      }

      // Find the bundle outputs that need flow entries:
      for (const n in bundle) {
        const file = bundle[n]
        if (file.isAsset || !file.isEntry || file.facadeModuleId == null) {
          continue
        }

        // rollup-plugin-multi-entry:
        if (file.facadeModuleId === multiEntryId) {
          if (savedMultiEntry == null || opts.file == null) {
            this.warn(
              'Unable to create Flow entry: rollup-plugin-multi-entry not configured correctly'
            )
            continue
          }
          pushFlowEntry(
            path.basename(opts.file),
            parseMultiEntry(outDir, savedMultiEntry)
          )
          continue
        }

        // Normal files:
        pushFlowEntry(file.fileName, file.facadeModuleId)
      }

      // Generate the entries:
      for (const entry of entries) {
        const asset = buildAsset(outDir, entry, config.mode)
        bundle[asset.fileName] = asset
      }
    }
  }
}
