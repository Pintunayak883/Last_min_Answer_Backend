const express = require("express");
const universityController = require("../controllers/university.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", universityController.getAll.bind(universityController));
router.get("/:id", universityController.getById.bind(universityController));

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  universityController.create.bind(universityController)
);
router.put(
  "/:id",
  authMiddleware,
  universityController.update.bind(universityController)
);
router.delete(
  "/:id",
  authMiddleware,
  universityController.delete.bind(universityController)
);

module.exports = router;
