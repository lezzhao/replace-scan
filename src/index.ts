import { promises as fs } from 'fs'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'url'
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

export async function findUnusedFiles(files: Target, options: { alias?: { [key: string]: string } } = {}) {
  const { alias } = options
  const globs = await fg(files, {
    dot: true,
    absolute: true,
  })
  // console.log(globs, 'globs')

  const tar = Array.isArray(files) ? files[0] : files
  const [suffix] = tar.match(/\.\w*/)!
  const importRE = /import(?:.*?)from\s*['|"](\S*)['|"]/g
  const exporRE = /export(?:.*?)from\s*['|"](\S*)['|"]/g

  const fileSet = new Set(globs.flatMap(f => pathToFileURL(f.replace(extname(f), '')).href))
  // console.log(fileSet, 'fileSet')
  for (const file of globs) {
    const code = await fs.readFile(file, 'utf-8')
    const matchs = Array.from(code.matchAll(importRE))
    const matchs2 = Array.from(code.matchAll(exporRE))

    if (matchs.length) {
      matchs.forEach(async (match) => {
        let transformPath = match[1]
        if (alias) {
          const key = Object.keys(alias).find(key => transformPath.startsWith(key))
          if (key)
            transformPath = transformPath.startsWith(key) ? transformPath.replace(key, alias[key]) : transformPath
        }

        const filePath = pathToFileURL(new URL(transformPath, pathToFileURL(file).href).href).href

        const finalPath = filePath.replace(extname(filePath), '')
        console.log(match[1], finalPath, 'skwmdwk')

        if (fileSet.has(finalPath))
          fileSet.delete(finalPath)
      })
    }
    if (matchs2.length) {
      matchs2.forEach((match) => {
        const filePath = resolve(__dirname, match[1].endsWith(suffix) ? match[1] : `${match[1]}.${suffix}`)
        if (fileSet.has(filePath))
          fileSet.delete(filePath)
      })
    }
  }

  return []
}

