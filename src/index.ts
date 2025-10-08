import { app, setReady } from "./main"

const PORT = Number(process.env.PORT) || 5000
const HOST = process.env.HOST || "0.0.0.0"
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || "5000", 10)

let server: ReturnType<typeof app.listen> | undefined

function gracefulShutdown(signal: string) {
  console.log(`[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`)
  setReady(false)

  if (server) {
    setTimeout(() => {
      console.error("Forcing shutdown after timeout")
      process.exit(1)
    }, SHUTDOWN_TIMEOUT).unref()

    server.close(() => {
      console.log(`[${new Date().toISOString()}] Server closed.`)
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

// Process signal handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason)
  gracefulShutdown("unhandledRejection")
})
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err)
  gracefulShutdown("uncaughtException")
})

// Server startup
try {
  server = app.listen(PORT, HOST, () => {
    console.log(`[${new Date().toISOString()}] Server running at http://${HOST}:${PORT}`)
    console.log("Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      PORT,
      HOST,
      SHUTDOWN_TIMEOUT
    })
    setReady(true)
  })
} catch (err) {
  console.error(`[${new Date().toISOString()}] Failed to start server:`, err)
  process.exit(1)
}
