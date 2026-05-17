import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ApiLog from "../models/apiLogModel.js";
import SystemConfig from "../models/systemConfigModel.js";
import { clearConfigCache } from "../middleware/apiMonitorMiddleware.js";

/**
 * @desc    Get paginated chronological API logs
 * @route   GET /api/system-metrics/logs
 * @access  Private/Admin
 */
export const getApiLogs = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await ApiLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await ApiLog.countDocuments({});

    res.json({
      success: true,
      logs,
      pagination: {
        total: totalLogs,
        page,
        pages: Math.ceil(totalLogs / limit),
      },
    });
  },
);

/**
 * @desc    Get aggregated API metrics summary
 * @route   GET /api/system-metrics/summary
 * @access  Private/Admin
 */
export const getApiMetricsSummary = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Basic aggregation counts
    const totalRequests = await ApiLog.countDocuments();
    const errorRequests = await ApiLog.countDocuments({
      statusCode: { $gte: 400 },
    });
    const successRequests = totalRequests - errorRequests;

    // A rough "uptime" tracking success vs fail ratio based on all recorded traffic
    const uptimeRatio =
      totalRequests > 0 ? (successRequests / totalRequests) * 100 : 100;

    // Aggregating Average Response Time safely
    const avgResponseData = await ApiLog.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$responseTimeMs" },
        },
      },
    ]);

    const averageResponseTime =
      avgResponseData.length > 0 ? Math.round(avgResponseData[0].avgTime) : 0;

    res.json({
      success: true,
      summary: {
        totalRequests,
        errorRequests,
        successRequests,
        uptimeRatio: parseFloat(uptimeRatio.toFixed(2)),
        averageResponseTime,
      },
    });
  },
);

/**
 * @desc    Flush all API logs
 * @route   DELETE /api/system-metrics/flush
 * @access  Private/Admin
 */
export const flushApiLogs = expressAsyncHandler(
  async (req: Request, res: Response) => {
    await ApiLog.deleteMany({});
    res.json({
      success: true,
      message: "All API logs have been successfully flushed.",
    });
  },
);

/**
 * @desc    Get system configuration (API log level)
 * @route   GET /api/system-metrics/config
 * @access  Private/Admin
 */
export const getSystemConfig = expressAsyncHandler(
  async (req: Request, res: Response) => {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ apiLogLevel: "error" });
    }

    res.json({
      success: true,
      config,
    });
  },
);

/**
 * @desc    Update system configuration (API log level)
 * @route   PUT /api/system-metrics/config
 * @access  Private/Admin
 */
export const updateSystemConfig = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { apiLogLevel } = req.body;

    if (!["all", "error", "success", "none"].includes(apiLogLevel)) {
      res.status(400);
      throw new Error(
        "Invalid API log level. Allowed: all, error, success, none",
      );
    }

    let config = await SystemConfig.findOne();
    if (config) {
      config.apiLogLevel = apiLogLevel;
      const updatedConfig = await config.save();

      // Clear the in-memory cache in the middleware to pick up the new setting immediately
      clearConfigCache();

      res.json({
        success: true,
        config: updatedConfig,
      });
    } else {
      const newConfig = await SystemConfig.create({ apiLogLevel });
      clearConfigCache();
      res.status(201).json({
        success: true,
        config: newConfig,
      });
    }
  },
);
