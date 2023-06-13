import fg from 'fast-glob'
import type { ExtraOptions, ReplaceRules, Target } from './type'
import { transform } from './transform'

export async function transformContent(files: Target, rules: ReplaceRules, options?: ExtraOptions) {
  const globs = await fg(files, {
    dot: true,
  })
  let code = ''
  for (const file of globs)
    code += await transform(file, rules, options)

  return code
}

