const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const FileUtil = require("../utils/file.util");
const ApiResponse = require("../utils/response.util");

// Helper to get relative path for storage
function getRelativePath(absolutePath) {
  // Extract path starting from 'uploads/'
  const uploadsIndex = absolutePath.indexOf("uploads");
  if (uploadsIndex !== -1) {
    return absolutePath.substring(uploadsIndex).replace(/\\/g, "/");
  }
  return absolutePath.replace(/\\/g, "/");
}

// Helper to transform question papers with fileUrl
function transformQuestionPapers(papers) {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  const getCleanPath = (filePath) => {
    // Extract path starting from 'uploads/'
    const uploadsIndex = filePath.indexOf("uploads");
    if (uploadsIndex !== -1) {
      return filePath.substring(uploadsIndex).replace(/\\/g, "/");
    }
    return filePath.replace(/\\/g, "/");
  };

  if (Array.isArray(papers)) {
    return papers.map((paper) => ({
      ...paper,
      fileName:
        paper.year && paper.month
          ? `QuestionPaper-${paper.year}-${paper.month}.pdf`
          : "question-paper.pdf",
      fileUrl: `${baseUrl}/${getCleanPath(paper.filePath)}`,
      fileSize: paper.fileSize || 0,
    }));
  }
  return {
    ...papers,
    fileName:
      papers.year && papers.month
        ? `QuestionPaper-${papers.year}-${papers.month}.pdf`
        : "question-paper.pdf",
    fileUrl: `${baseUrl}/${getCleanPath(papers.filePath)}`,
    fileSize: papers.fileSize || 0,
  };
}

class QuestionPaperController {
  /**
   * Upload question paper
   * POST /question-papers
   */
  async upload(req, res, next) {
    try {
      const { subjectId, year, month } = req.body;

      if (!req.file) {
        return ApiResponse.error(res, 400, "No file uploaded");
      }

      // Check if subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        // Delete uploaded file if subject not found
        await FileUtil.deleteFile(req.file.path);
        return ApiResponse.error(res, 404, "Subject not found");
      }

      // Create question paper
      const relativePath = getRelativePath(req.file.path);
      const questionPaper = await prisma.questionPaper.create({
        data: {
          subjectId,
          filePath: relativePath,
          year,
          month,
        },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(
        `question-papers:subject:${subjectId}`
      );
      await cacheService.delete(cacheService.getCacheKey.subject(subjectId));

      return ApiResponse.success(
        res,
        201,
        "Question paper uploaded successfully",
        questionPaper
      );
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await FileUtil.deleteFile(req.file.path);
      }
      next(error);
    }
  }

  /**
   * Get question papers by subject
   * GET /question-papers/subject/:subjectId
   */
  async getBySubject(req, res, next) {
    try {
      const { subjectId } = req.params;

      // Check cache
      const cacheKey = cacheService.getCacheKey.questionPapers(subjectId);
      let questionPapers = await cacheService.get(cacheKey);

      if (!questionPapers) {
        questionPapers = await prisma.questionPaper.findMany({
          where: { subjectId },
          orderBy: { year: "desc" },
          include: {
            subject: {
              include: {
                term: {
                  include: {
                    course: {
                      include: {
                        university: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Store in cache
        await cacheService.set(cacheKey, questionPapers);
      }

      // Transform to include fileUrl
      const transformedPapers = transformQuestionPapers(questionPapers);
      return ApiResponse.success(
        res,
        200,
        "Question papers fetched successfully",
        transformedPapers
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get question paper by ID
   * GET /question-papers/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const questionPaper = await prisma.questionPaper.findUnique({
        where: { id },
        include: {
          subject: {
            include: {
              term: {
                include: {
                  course: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!questionPaper) {
        return ApiResponse.error(res, 404, "Question paper not found");
      }

      return ApiResponse.success(
        res,
        200,
        "Question paper fetched successfully",
        questionPaper
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update question paper
   * PUT /question-papers/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { year, month } = req.body;

      const existingPaper = await prisma.questionPaper.findUnique({
        where: { id },
      });

      if (!existingPaper) {
        // Clean up uploaded file if exists
        if (req.file) {
          await FileUtil.deleteFile(req.file.path);
        }
        return ApiResponse.error(res, 404, "Question paper not found");
      }

      const updateData = { year, month };

      // If new file uploaded, delete old file
      if (req.file) {
        await FileUtil.deleteFile(existingPaper.filePath);
        updateData.filePath = req.file.path;
      }

      const questionPaper = await prisma.questionPaper.update({
        where: { id },
        data: updateData,
      });

      // Invalidate cache
      await cacheService.deleteByPattern(
        `question-papers:subject:${questionPaper.subjectId}`
      );
      await cacheService.delete(
        cacheService.getCacheKey.subject(questionPaper.subjectId)
      );

      return ApiResponse.success(
        res,
        200,
        "Question paper updated successfully",
        questionPaper
      );
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await FileUtil.deleteFile(req.file.path);
      }
      next(error);
    }
  }

  /**
   * Delete question paper
   * DELETE /question-papers/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const questionPaper = await prisma.questionPaper.findUnique({
        where: { id },
      });

      if (!questionPaper) {
        return ApiResponse.error(res, 404, "Question paper not found");
      }

      // Delete file from disk
      await FileUtil.deleteFile(questionPaper.filePath);

      // Delete from database
      await prisma.questionPaper.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(
        `question-papers:subject:${questionPaper.subjectId}`
      );
      await cacheService.delete(
        cacheService.getCacheKey.subject(questionPaper.subjectId)
      );

      return ApiResponse.success(
        res,
        200,
        "Question paper deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionPaperController();
