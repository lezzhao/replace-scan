import { promises as fs } from 'fs'
import { isFunction } from '@antfu/utils'
import type { ExtraOptions, ReplaceRules, RuleTuple } from './type'

export async function transform(file: string, rules: ReplaceRules, _options?: ExtraOptions) {
  const code = await fs.readFile(file, 'utf-8')

  function transformCode(rule: RuleTuple) {
    const matchs = Array.from(code.matchAll(new RegExp(rule[0], 'g')))
    if (!matchs.length)
      return
    for (const match of matchs) {
      let str = ''
      //   console.log(match)
      if (isFunction(rule[1])) {
        console.log(match[0])
        str = match[0].replace(rule[0], rule[1])
      }
      else {
        const start = match.index
        const end = (match.index || 0) + (match[0]!.length || 0)
        str = match[0].slice(0, start) + rule[1] + match.slice(end)
      }
      console.log(str)
    }
  }

  if (rules.flat().length === 2) {
    transformCode(rules.flat() as RuleTuple)
  }
  else {
    for (const rule of rules)
      transformCode(rule as RuleTuple)
  }

  await fs.writeFile(file, code)
  return code
}
