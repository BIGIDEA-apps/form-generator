import { copyFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs = join(root, 'node_modules', 'tinyexec', 'dist', 'main.js')
const mainMjs = join(root, 'node_modules', 'tinyexec', 'dist', 'main.mjs')

if (!existsSync(mainJs) && existsSync(mainMjs)) {
  copyFileSync(mainMjs, mainJs)
}
