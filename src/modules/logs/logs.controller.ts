import fs from "node:fs"
import path from "node:path"
import type { Request, Response } from "express"
import { getLogFileNames } from "./logs.helpers"

const getAllErrorLogs = async (_req: Request, res: Response) => {
  const errorFiles = getLogFileNames("errors")

  if (errorFiles.length === 0) {
    res.status(200).send(`<h1>Error Logs</h1><p>No error logs available.</p>`)
  } else {
    const fileListHTML = errorFiles
      .map(
        (file) => `
      <li><a href="/logs/errors/${file}">${file}</a></li>
    `
      )
      .join("")

    res.status(200).send(`
    <html>
      <head>
        <title>Error Logs</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Error Logs</h1>
        <ul>${fileListHTML}</ul>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `)
  }
}
const getAllSuccessLogs = async (_req: Request, res: Response) => {
  const successFiles = getLogFileNames("successes")

  if (successFiles.length === 0) {
    res.status(200).send(`<h1>Success Logs</h1><p>No success logs available.</p>`)
  } else {
    const fileListHTML = successFiles
      .map(
        (file) => `
      <li><a href="/logs/successes/${file}">${file}</a></li>
    `
      )
      .join("")

    res.status(200).send(`
    <html>
      <head>
        <title>Success Logs</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Success Logs</h1>
        <ul>${fileListHTML}</ul>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `)
  }
}

const getSpecificErrorLog = async (req: Request<{ filename: string }>, res: Response) => {
  const logfile = req.params.filename
  if (!logfile) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Bad Request</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1>Bad Request</h1>
          <p>Log file ID is required</p>
          <a href="/logs/errors">Back to Error Logs</a>
        </body>
      </html>
    `)
  }

  const logPath = path.join(process.cwd(), "logs", "winston", "errors", logfile)

  if (fs.existsSync(logPath)) {
    fs.readFile(logPath, "utf8", (err, data) => {
      if (err) {
        res.status(500).send(`
          <html>
            <head>
              <title>Error</title>
              <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
              <h1>Error</h1>
              <p>Failed to read log file.</p>
              <a href="/logs/errors">Back to Error Logs</a>
            </body>
          </html>
        `)
      } else {
        res.status(200).send(`
          <html>
            <head>
              <title>Log File: ${logfile}</title>
              <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
              <h1>Log File: ${logfile}</h1>
              <pre>${data}</pre>
              <a href="/logs/errors">Back to Error Logs</a>
            </body>
          </html>
        `)
      }
    })
  } else {
    res.status(404).send(`
      <html>
        <head>
          <title>Log Not Found</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1>Log Not Found</h1>
          <p>The log file ${logfile} does not exist.</p>
          <a href="/logs/errors">Back to Error Logs</a>
        </body>
      </html>
    `)
  }
}

const getSpecificSuccessLog = async (req: Request<{ filename: string }>, res: Response) => {
  const logfile = req.params.filename
  if (!logfile) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Bad Request</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1>Bad Request</h1>
          <p>Log file ID is required</p>
          <a href="/logs/successes">Back to Success Logs</a>
        </body>
      </html>
    `)
  }

  const logPath = path.join(process.cwd(), "logs", "winston", "successes", logfile)

  if (fs.existsSync(logPath)) {
    fs.readFile(logPath, "utf8", (err, data) => {
      if (err) {
        res.status(500).send(`
          <html>
            <head>
              <title>Error</title>
              <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
              <h1>Error</h1>
              <p>Failed to read log file.</p>
              <a href="/logs/successes">Back to Success Logs</a>
            </body>
          </html>
        `)
      } else {
        res.status(200).send(`
          <html>
            <head>
              <title>Log File: ${logfile}</title>
              <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
              <h1>Log File: ${logfile}</h1>
              <pre>${data}</pre>
              <a href="/logs/successes">Back to Success Logs</a>
            </body>
          </html>
        `)
      }
    })
  } else {
    res.status(404).send(`
        <html>
          <head>
            <title>Log Not Found</title>
            <link rel="stylesheet" href="/styles.css">
          </head>
          <body>
            <h1>Log Not Found</h1>
            <p>The log file ${logfile} does not exist.</p>
            <a href="/logs/successes">Back to Success Logs</a>
          </body>
        </html>
      `)
  }
}

export const logsController = {
  getAllSuccessLogs,
  getAllErrorLogs,
  getSpecificSuccessLog,
  getSpecificErrorLog
}
