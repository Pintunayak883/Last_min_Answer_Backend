const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const FileUtil = require("../utils/file.util");
const ApiResponse = require("../utils/response.util");
const path = require("path");

// Helper to get relative path for storage
function getRelativePath(absolutePath) {
  // Extract path starting from 'uploads/'
  const uploadsIndex = absolutePath.indexOf("uploads");
  if (uploadsIndex !== -1) {
    return absolutePath.substring(uploadsIndex).replace(/\\/g, "/");
  }
  return absolutePath.replace(/\\/g, "/");
}

// Helper to transform syllabus with fileUrl
function transformSyllabus(syllabus) {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  const getCleanPath = (filePath) => {
    // Extract path starting from 'uploads/'
    const uploadsIndex = filePath.indexOf("uploads");
    if (uploadsIndex !== -1) {
      return filePath.substring(uploadsIndex).replace(/\\/g, "/");
    }
    return filePath.replace(/\\/g, "/");
  };

  if (Array.isArray(syllabus)) {
    return syllabus.map((item) => ({
      ...item,
      fileName: item.year ? `Syllabus-${item.year}.pdf` : "syllabus.pdf",
      fileUrl: `${baseUrl}/${getCleanPath(item.filePath)}`,
      fileSize: item.fileSize || 0,
    }));
  }
  return {
    ...syllabus,
    fileName: syllabus.year ? `Syllabus-${syllabus.year}.pdf` : "syllabus.pdf",
    fileUrl: `${baseUrl}/${getCleanPath(syllabus.filePath)}`,
    fileSize: syllabus.fileSize || 0,
  };
}

class SyllabusController {
  /**
   * Upload syllabus
   * POST /syllabus
   */
  async upload(req, res, next) {
    try {
      const { subjectId, year } = req.body;

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

      // Check if syllabus already exists for this subject
      const existingSyllabus = await prisma.syllabus.findUnique({
        where: { subjectId },
      });

      // If exists, delete old file
      if (existingSyllabus) {
        await FileUtil.deleteFile(existingSyllabus.filePath);
      }

      // Create or update syllabus
      const relativePath = getRelativePath(req.file.path);
      const syllabus = await prisma.syllabus.upsert({
        where: { subjectId },
        update: {
          filePath: relativePath,
          year,
        },
        create: {
          subjectId,
          filePath: relativePath,
          year,
        },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.syllabus(subjectId));
      await cacheService.delete(cacheService.getCacheKey.subject(subjectId));

      return ApiResponse.success(
        res,
        201,
        "Syllabus uploaded successfully",
        syllabus
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
   * Get syllabus by subject
   * GET /syllabus/subject/:subjectId
   */
  async getBySubject(req, res, next) {
    try {
      const { subjectId } = req.params;

      // Check cache
      const cacheKey = cacheService.getCacheKey.syllabus(subjectId);
      let syllabus = await cacheService.get(cacheKey);

      if (!syllabus) {
        syllabus = await prisma.syllabus.findMany({
          where: { subjectId },
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
        await cacheService.set(cacheKey, syllabus);
      }

      // Transform to include fileUrl
      const transformedSyllabus = transformSyllabus(syllabus);
      return ApiResponse.success(
        res,
        200,
        "Syllabus fetched successfully",
        Array.isArray(transformedSyllabus) ? transformedSyllabus : []
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete syllabus
   * DELETE /syllabus/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const syllabus = await prisma.syllabus.findUnique({
        where: { id },
      });

      if (!syllabus) {
        return ApiResponse.error(res, 404, "Syllabus not found");
      }

      // Delete file from disk
      await FileUtil.deleteFile(syllabus.filePath);

      // Delete from database
      await prisma.syllabus.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.delete(
        cacheService.getCacheKey.syllabus(syllabus.subjectId)
      );
      await cacheService.delete(
        cacheService.getCacheKey.subject(syllabus.subjectId)
      );

      return ApiResponse.success(res, 200, "Syllabus deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SyllabusController();
