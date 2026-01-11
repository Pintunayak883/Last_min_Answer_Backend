const express = require("express");
const courseController = require("../controllers/course.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", courseController.getAll.bind(courseController));
router.get("/:id", courseController.getById.bind(courseController));

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  courseController.create.bind(courseController)
);
router.put(
  "/:id",
  authMiddleware,
  courseController.update.bind(courseController)
);
router.delete(
  "/:id",
  authMiddleware,
  courseController.delete.bind(courseController)
);

module.exports = router;
