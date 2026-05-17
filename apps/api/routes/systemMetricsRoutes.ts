import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getApiLogs,
  getApiMetricsSummary,
  flushApiLogs,
  getSystemConfig,
  updateSystemConfig,
} from "../controllers/systemMetricsController.js";

const router = express.Router();

// Private Admin Routes
router.route("/logs").get(protect, admin, getApiLogs);
router.route("/summary").get(protect, admin, getApiMetricsSummary);
router.route("/flush").delete(protect, admin, flushApiLogs);
router
  .route("/config")
  .get(protect, admin, getSystemConfig)
  .put(protect, admin, updateSystemConfig);

export default router;
