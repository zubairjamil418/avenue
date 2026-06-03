import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.memoryStorage();

const videoFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith("video/")) {
    cb(new Error("Only video files are allowed!"));
    return;
  }

  const allowedExtensions = [".mp4", ".webm", ".mov", ".m4v", ".avi"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    cb(new Error("Invalid video format. Allowed: mp4, webm, mov, m4v, avi"));
    return;
  }

  cb(null, true);
};

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export default videoUpload;
