import mongoose, { Document } from "mongoose";

export interface ISystemConfigDocument extends Document {
  apiLogLevel: "all" | "error" | "success" | "none";
  updatedAt: Date;
}

const systemConfigSchema = new mongoose.Schema<ISystemConfigDocument>(
  {
    apiLogLevel: {
      type: String,
      enum: ["all", "error", "success", "none"],
      default: "error", // Default to logging only errors
    },
  },
  {
    timestamps: true,
  },
);

const SystemConfig = mongoose.model<ISystemConfigDocument>(
  "SystemConfig",
  systemConfigSchema,
);

export default SystemConfig;
