const express = require("express");
const questionPaperController = require("../controllers/question-paper.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Public routes
router.get(
  "/subject/:subjectId",
  questionPaperController.getBySubject.bind(questionPaperController)
);
router.get(
  "/:id",
  questionPaperController.getById.bind(questionPaperController)
);

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  questionPaperController.upload.bind(questionPaperController)
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("file"),
  questionPaperController.update.bind(questionPaperController)
);

router.delete(
  "/:id",
  authMiddleware,
  questionPaperController.delete.bind(questionPaperController)
);

module.exports = router;
