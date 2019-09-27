import path from 'path'

import { buildEntry, parseMultiEntry } from './helpers.js'

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

      for (const n in bundle) {
        const file = bundle[n]
        if (file.isAsset || !file.isEntry || file.facadeModuleId == null) {
          continue
        }

        if (file.facadeModuleId !== multiEntryId) {
          // Normal files:
          const entry = buildEntry(config, outDir, file.fileName, [
            file.facadeModuleId
          ])
          bundle[entry.fileName] = entry
        } else {
          // rollup-plugin-multi-entry:
          if (savedMultiEntry == null || opts.file == null) {
            this.warn(
              'Unable to create Flow entry: rollup-plugin-multi-entry not configured correctly'
            )
            continue
          }

          const entry = buildEntry(
            config,
            outDir,
            path.basename(opts.file),
            parseMultiEntry(outDir, savedMultiEntry)
          )
          bundle[entry.fileName] = entry
        }
      }
    }
  }
}
