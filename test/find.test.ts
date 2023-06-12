import { describe, expect, it } from 'vitest'
import { findUnusedFiles } from '../src'

describe('find unused file list', () => {
  it.only('find unused file list', async () => {
    expect(await findUnusedFiles(['**/examples/src/common/router/**/*.ts', '!**/common/services/**/*.ts', '!**/*.d.ts'])).toMatchInlineSnapshot('[]')
  })
})
