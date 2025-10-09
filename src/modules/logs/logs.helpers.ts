import fs from "node:fs"
import path from "node:path"
import { tryCatchSync } from "@/helpers/try-catch"

export const getLogFileNames = (logType: string): string[] => {
  const logDir = path.join(process.cwd(), "logs", "winston", logType)
  const result = tryCatchSync(() => fs.readdirSync(logDir).filter((file) => file.endsWith(".log")))
  if (result.error) {
    console.error(`Failed to list ${logType} logs: `, result.error)
    return []
  }
  return result.data
}
