import path from "path"
import fs from "fs"
import process from "process"
import { pathToFileURL } from "url"

export const BASE_PATH = process.cwd()

// Verbose JSON loader that helps not to forget to build project
export function loadAssetsMeta (filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(BASE_PATH, filename)))
  } catch (e) {
    console.warn('ERROR: Make sure that the project was built, run `npm run build`')
    console.error(e)
    process.exit(1)
  }
}
