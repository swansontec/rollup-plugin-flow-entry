// @flow

import { common } from './common.js'

export function demo(a: number, b: string): string {
  common()
  return a.toString() + b
}
