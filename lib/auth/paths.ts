import fs from "node:fs"
import path from "node:path"

const DB_FILE = "volunteer-connect.sqlite"

/** Resolve a stable project data directory, even if a Next worker cwd drifts. */
export function resolveDataDir(): string {
  if (process.env.VOLUNTEER_CONNECT_DATA_DIR) {
    return path.resolve(process.env.VOLUNTEER_CONNECT_DATA_DIR)
  }

  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const pkg = path.join(dir, "package.json")
    const app = path.join(dir, "app")
    if (fs.existsSync(pkg) && fs.existsSync(app)) {
      return path.join(dir, "data")
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  return path.join(process.cwd(), "data")
}

export function getDatabasePath(): string {
  return path.join(resolveDataDir(), DB_FILE)
}
