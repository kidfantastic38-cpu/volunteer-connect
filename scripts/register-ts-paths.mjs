import { register } from "node:module"
import { pathToFileURL } from "node:url"
import path from "node:path"

register(pathToFileURL(path.join(import.meta.dirname, "ts-paths-loader.mjs")).href)
