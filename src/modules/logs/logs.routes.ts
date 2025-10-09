import express from "express"
import { logsController } from "./logs.controller"

const router = express.Router()

/**
 * Error Logs Routes
 */
router.get("/errors", logsController.getAllErrorLogs)
router.get("/errors/:filename", logsController.getSpecificErrorLog)

/**
 * Success Logs Routes
 */
router.get("/successes", logsController.getAllSuccessLogs)
router.get("/successes/:filename", logsController.getSpecificSuccessLog)

export const LogsRoutes = router
