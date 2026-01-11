const express = require("express");
const syllabusController = require("../controllers/syllabus.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Public routes
router.get(
  "/subject/:subjectId",
  syllabusController.getBySubject.bind(syllabusController)
);

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  syllabusController.upload.bind(syllabusController)
);

router.delete(
  "/:id",
  authMiddleware,
  syllabusController.delete.bind(syllabusController)
);

module.exports = router;
