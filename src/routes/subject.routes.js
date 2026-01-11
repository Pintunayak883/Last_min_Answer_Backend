const express = require("express");
const subjectController = require("../controllers/subject.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", subjectController.getAll.bind(subjectController));
router.get("/:id", subjectController.getById.bind(subjectController));

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  subjectController.create.bind(subjectController)
);
router.put(
  "/:id",
  authMiddleware,
  subjectController.update.bind(subjectController)
);
router.delete(
  "/:id",
  authMiddleware,
  subjectController.delete.bind(subjectController)
);

module.exports = router;
