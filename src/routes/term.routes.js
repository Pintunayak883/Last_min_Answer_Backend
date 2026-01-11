const express = require("express");
const termController = require("../controllers/term.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", termController.getAll.bind(termController));
router.get("/:id", termController.getById.bind(termController));

// Protected routes (Admin only)
router.post("/", authMiddleware, termController.create.bind(termController));
router.put("/:id", authMiddleware, termController.update.bind(termController));
router.delete(
  "/:id",
  authMiddleware,
  termController.delete.bind(termController)
);

module.exports = router;
