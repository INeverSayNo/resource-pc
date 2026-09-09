import { readdir, readFile } from 'node:fs/promises'
import { extname, relative } from 'node:path'
import process from 'node:process'

const root = new URL('../src/', import.meta.url)
const supportedExtensions = new Set(['.ts', '.tsx', '.js', '.vue', '.less', '.scss', '.css'])
const forbidden = [
  ['legacy HttpRequest', /\bHttpRequest\b/],
  ['Vuex', /(?:from\s+['"]vuex['"]|vuex-module-decorators)/],
  ['legacy alias', /(?:from\s+|import\s*\(|require\s*\()\s*['"]_(?:v|c|@|p)\//],
  ['legacy style alias', /(?:~@\/|['"]_(?:v|c|@|p)\/)/],
  ['Webpack require', /\brequire(?:\.context)?\s*\(/],
  ['Webpack environment', /\bprocess\.env\b/],
  ['Element Plus internal import', /['"]element-plus\/lib\//],
  ['Element Plus 1 icon class', /\bel-icon-[a-z]/]
]

const files = []
const collect = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory)
    if (entry.isDirectory()) await collect(target)
    else if (supportedExtensions.has(extname(entry.name)) && !/\.(?:spec|test)\./.test(entry.name)) {
      files.push(target)
    }
  }
}

await collect(root)
const violations = []
for (const file of files) {
  const source = await readFile(file, 'utf8')
  const lines = source.split(/\r?\n/)
  for (const [name, pattern] of forbidden) {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        violations.push(`${relative(new URL('../', root).pathname, file.pathname)}:${index + 1} ${name}`)
      }
    })
  }
}

if (violations.length) {
  console.error(`Migration boundary violations:\n${violations.join('\n')}`)
  process.exitCode = 1
} else {
  console.log('Migration boundaries passed')
}
