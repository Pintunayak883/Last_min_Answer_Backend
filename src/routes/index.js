const express = require("express");
const adminRoutes = require("./admin.routes");
const universityRoutes = require("./university.routes");
const courseRoutes = require("./course.routes");
const termRoutes = require("./term.routes");
const subjectRoutes = require("./subject.routes");
const syllabusRoutes = require("./syllabus.routes");
const questionPaperRoutes = require("./question-paper.routes");
const notesRoutes = require("./notes.routes");

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// API routes
router.use("/admin", adminRoutes);
router.use("/universities", universityRoutes);
router.use("/courses", courseRoutes);
router.use("/terms", termRoutes);
router.use("/subjects", subjectRoutes);
router.use("/syllabus", syllabusRoutes);
router.use("/question-papers", questionPaperRoutes);
router.use("/notes", notesRoutes);

module.exports = router;
