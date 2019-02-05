// @flow

import { common } from './common.js'

export function demo2 (a: Array<string>): string {
  common()
  return a.join('')
}
