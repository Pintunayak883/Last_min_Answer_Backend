const multer = require("multer");
const path = require("path");
const config = require("../config/config");
const FileUtil = require("../utils/file.util");

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath;

    // Use multiple signals to detect route; nested routers set baseUrl but path can be '/'
    const routePath = `${req.baseUrl || ""}${req.path || ""}`.toLowerCase();
    const originalPath = (req.originalUrl || "").toLowerCase();

    if (routePath.includes("syllabus") || originalPath.includes("syllabus")) {
      uploadPath = config.upload.paths.syllabus;
    } else if (routePath.includes("notes") || originalPath.includes("notes")) {
      uploadPath = config.upload.paths.notes;
    } else if (
      routePath.includes("question-paper") ||
      routePath.includes("question-papers") ||
      originalPath.includes("question-paper") ||
      originalPath.includes("question-papers")
    ) {
      uploadPath = config.upload.paths.questionPapers;
    } else {
      // Helpful debug log for misrouted uploads
      console.error("Invalid upload path", {
        baseUrl: req.baseUrl,
        path: req.path,
        originalUrl: req.originalUrl,
      });
      return cb(new Error("Invalid upload path"));
    }

    try {
      await FileUtil.ensureDirectory(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = FileUtil.generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (FileUtil.isValidFileType(file.mimetype, config.upload.allowedTypes)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

module.exports = upload;
