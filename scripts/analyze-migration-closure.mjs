import { copyFile, mkdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from 'node:path'
import process from 'node:process'

const cliArgs = process.argv.slice(2)
const sourceRoot = resolve(cliArgs.shift() || '../old_pc/src')
const targetOption = cliArgs.find((arg) => arg.startsWith('--target='))
const targetRoot = targetOption ? resolve(targetOption.slice('--target='.length)) : ''
const copy = cliArgs.includes('--copy')
const entries = cliArgs.filter((arg) => !arg.startsWith('--'))
if (!entries.length) {
  console.error('Usage: node scripts/analyze-migration-closure.mjs <source-root> <entry...>')
  process.exit(1)
}

const aliases = {
  '@/': sourceRoot,
  '_c/': join(sourceRoot, 'components'),
  '_@/': join(sourceRoot, 'pages/index'),
  '_v/': join(sourceRoot, 'pages/index/views'),
  '_p/': join(sourceRoot, 'pages')
}
const extensions = ['', '.ts', '.tsx', '.js', '.vue', '.less', '.scss', '.css', '.json']
const seen = new Set()
const packages = new Set()
const unresolved = new Set()
const boundaries = new Set()
const architectureBoundaries = [
  'pages/index/api/',
  'pages/index/axios-config/',
  'pages/index/router/',
  'pages/index/store/'
]

const isFile = async (path) => stat(path).then((value) => value.isFile()).catch(() => false)

const resolveLocal = async (specifier, importer) => {
  let base
  if (specifier.startsWith('.')) base = resolve(dirname(importer), specifier)
  else {
    const alias = Object.keys(aliases).find((prefix) => specifier.startsWith(prefix))
    if (!alias) return null
    base = join(aliases[alias], specifier.slice(alias.length))
  }
  for (const extension of extensions) {
    const candidate = normalize(`${base}${extension}`)
    if (await isFile(candidate)) return candidate
  }
  for (const extension of extensions.slice(1)) {
    const candidate = join(base, `index${extension}`)
    if (await isFile(candidate)) return candidate
  }
  return undefined
}

const importsFrom = (source) => {
  const result = []
  const pattern = /(?:from\s*|import\s*\(|require\s*\(|@import\s+(?:url\()?\s*)['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) result.push(match[1])
  return result
}

const targetFor = (file) => {
  const sourcePath = relative(sourceRoot, file)
  return sourcePath.startsWith('pages/index/views/')
    ? join(targetRoot, 'views', sourcePath.slice('pages/index/views/'.length))
    : join(targetRoot, sourcePath)
}

const visit = async (file) => {
  const absolute = isAbsolute(file) ? file : resolve(file)
  if (seen.has(absolute)) return
  const sourcePath = relative(sourceRoot, absolute)
  const isEntry = entries.some((entry) => resolve(sourceRoot, entry) === absolute)
  if (!isEntry && architectureBoundaries.some((prefix) => sourcePath.startsWith(prefix))) {
    boundaries.add(sourcePath)
    return
  }
  if (!isEntry && targetRoot && (await isFile(targetFor(absolute)))) {
    boundaries.add(sourcePath)
    return
  }
  seen.add(absolute)
  if (!['.ts', '.tsx', '.js', '.vue', '.less', '.scss', '.css'].includes(extname(absolute))) return
  const source = await readFile(absolute, 'utf8')
  for (const specifier of importsFrom(source)) {
    const local = await resolveLocal(specifier, absolute)
    if (local === null) packages.add(specifier)
    else if (local === undefined) unresolved.add(`${relative(sourceRoot, absolute)} -> ${specifier}`)
    else await visit(local)
  }
}

for (const entry of entries) await visit(resolve(sourceRoot, entry))

if (copy) {
  if (!targetRoot) throw new Error('--copy requires --target=<directory>')
  for (const file of seen) {
    const target = targetFor(file)
    await mkdir(dirname(target), { recursive: true })
    await copyFile(file, target)
  }
}

console.log(`Files (${seen.size})`)
console.log([...seen].map((file) => relative(sourceRoot, file)).sort().join('\n'))
console.log(`\nPackages (${packages.size})`)
console.log([...packages].sort().join('\n'))
console.log(`\nUnresolved (${unresolved.size})`)
console.log([...unresolved].sort().join('\n'))
console.log(`\nBoundaries (${boundaries.size})`)
console.log([...boundaries].sort().join('\n'))
