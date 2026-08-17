import path from "node:path"
import { pathToFileURL } from "node:url"

const root = pathToFileURL(path.resolve(process.cwd()) + path.sep).href

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context)
  }
  const bare = new URL(specifier.slice(2), root).href
  if (path.extname(specifier)) {
    return nextResolve(bare, context)
  }
  return nextResolve(`${bare}.ts`, context)
}
