import express from "express"
import { logsController } from "./logs.controller"

const router = express.Router()

/**
 * Error Logs Routes
 * GET /api/logs/errors - Get all error logs
 * GET /api/logs/errors/:id - Get specific error log
 */
router.get("/errors", logsController.getAllErrorLogs)
router.get("/errors/:id", logsController.getSpecificErrorLog)

/**
 * Success Logs Routes
 * GET /api/logs/successes - Get all success logs
 * GET /api/logs/successes/:id - Get specific success log
 */
router.get("/successes", logsController.getAllSuccessLogs)
router.get("/successes/:id", logsController.getSpecificSuccessLog)

export const LogsRoutes = router
