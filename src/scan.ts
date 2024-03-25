import { promises as fs } from 'node:fs'
import { extname, resolve } from 'node:path'
import fg from 'fast-glob'
import type { Target } from './type'

const importRE = /import(?:.*?)from\s*['|"](\S*)['|"]/g
const dynamicImportRE = /import\(['|"](\S*)['|"]\)/g
const requireRE = /require\(['|"](\S*)['|"]\)/g
const exporRE = /export(?:.*?)from\s*['|"](\S*)['|"]/g

interface Options {
  alias?: { [key: string]: string }
}

interface ScanOptions extends Options {
  collection: Set<string>
}

interface filterOptions extends ScanOptions {
  file: string
}

const filter = (matches: Array<RegExpMatchArray[]>, options: filterOptions) => {
  const { alias, collection, file } = options
  return matches.forEach((arrs) => {
    if (arrs.length) {
      arrs.forEach((match) => {
        let transformPath = match[1]
        let _alias
        if (alias) {
          const key = Object.keys(alias).find(key => transformPath.startsWith(key))
          if (key) {
            _alias = alias[key].replace(/^\.*/, '')
            transformPath = transformPath.startsWith(key) ? transformPath.replace(key, _alias) : transformPath
          }
        }
        let filePath = resolve(file, transformPath.startsWith('..') ? `../${transformPath}` : `.${transformPath}`)
        const i = _alias ? file.lastIndexOf(_alias) : -1
        if (i !== -1)
          filePath = file.slice(0, i) + transformPath

        const finalPath = filePath.replace(extname(filePath), '')
        if (collection?.has(finalPath))
          collection?.delete(finalPath)
      })
    }
  })
}

const scanContent = async (file: string, options: ScanOptions) => {
  const code = await fs.readFile(file, 'utf-8')
  const importMatches = Array.from(code.matchAll(importRE))
  const dynamicImportMatches = Array.from(code.matchAll(dynamicImportRE))
  const requireMatched = Array.from(code.matchAll(requireRE))
  const exportMatched = Array.from(code.matchAll(exporRE))
  filter([importMatches, dynamicImportMatches, requireMatched, exportMatched], { ...options, file })
}

export async function findUnusedFiles(files: Target, options: Options = {}) {
  const globs = await fg(files, {
    dot: true,
    absolute: true,
  })
  const collection = new Set(globs.flatMap(f => f.replace(extname(f), '')))
  for (const file of globs)
    await scanContent(file, { ...options, collection })

  return Array.from(collection).sort()
}

