const express = require("express");
const notesController = require("../controllers/notes.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Public routes
router.get(
  "/subject/:subjectId",
  notesController.getBySubject.bind(notesController)
);
router.get("/:id", notesController.getById.bind(notesController));

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  notesController.upload.bind(notesController)
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("file"),
  notesController.update.bind(notesController)
);

router.delete(
  "/:id",
  authMiddleware,
  notesController.delete.bind(notesController)
);

module.exports = router;
