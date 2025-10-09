import path from "node:path"
import express, { type Application, type NextFunction, type Request, type Response } from "express"
import { LogsRoutes } from "./modules/logs/logs.routes"
import { errorlogger } from "./shared/logger"

// Initialize Express app
const app: Application = express()

// Track if server is ready to accept requests
let isReady = false

// Middleware setup
app.use(express.static(path.join(__dirname, "../public")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Readiness check endpoint
app.get("/ready", (_req: Request, res: Response) => {
  if (isReady) {
    res.json({ status: "Ready", timestamp: new Date().toISOString() })
  } else {
    res.status(503).json({ status: "Not Ready", timestamp: new Date().toISOString() })
  }
})

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send(`
   <html>
      <head>
        <title>Docker Logs Viewer</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Welcome to the Docker Logs Viewer Page!</h1>
        <p>Go to <a href="/logs/errors">Error Logs</a> or <a href="/logs/successes">Success Logs</a>.</p>
      </body>
    </html>
  `)
})

app.get("/error", (_req: Request, _res: Response, next: NextFunction) => {
  const error = new Error("Simulated error!")
  next(error)
})

app.use("/logs", LogsRoutes)

// 404 Route Handler - Must be after all other routes
app.use((_req: Request, res: Response) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Page Not Found</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `)
})

// Error handling middleware - Keep only the error handler here
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  errorlogger.error(err)

  res.status(500).send(`
    <html>
      <head>
        <title>Error</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>${err.message}</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `)
})

export { app, isReady }
export const setReady = (ready: boolean) => {
  isReady = ready
}
