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

// Helper to transform notes without full URLs (frontend builds absolute URLs)
function transformNotes(notes) {
  if (Array.isArray(notes)) {
    return notes.map((note) => {
      const { fileUrl, ...rest } = note || {};
      return {
        ...rest,
        fileName: note.title || "download.pdf",
        fileSize: note.fileSize || 0,
      };
    });
  }
  const { fileUrl, ...rest } = notes || {};
  return {
    ...rest,
    fileName: notes.title || "download.pdf",
    fileSize: notes.fileSize || 0,
  };
}

class NotesController {
  /**
   * Upload notes
   * POST /notes
   */
  async upload(req, res, next) {
    try {
      const { subjectId, unit, title } = req.body;

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

      // Create notes
      const relativePath = getRelativePath(req.file.path);
      const notes = await prisma.notes.create({
        data: {
          subjectId,
          filePath: relativePath,
          unit,
          title,
        },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(`notes:subject:${subjectId}`);
      await cacheService.delete(cacheService.getCacheKey.subject(subjectId));

      return ApiResponse.success(
        res,
        201,
        "Notes uploaded successfully",
        notes,
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
   * Get notes by subject
   * GET /notes/subject/:subjectId
   */
  async getBySubject(req, res, next) {
    try {
      const { subjectId } = req.params;

      // Check cache
      const cacheKey = cacheService.getCacheKey.notes(subjectId);
      let notes = await cacheService.get(cacheKey);

      if (!notes) {
        notes = await prisma.notes.findMany({
          where: { subjectId },
          orderBy: { unit: "asc" },
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
        await cacheService.set(cacheKey, notes);
      }

      // Transform to include fileUrl
      const transformedNotes = transformNotes(notes);
      return ApiResponse.success(
        res,
        200,
        "Notes fetched successfully",
        transformedNotes,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notes by ID
   * GET /notes/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const notes = await prisma.notes.findUnique({
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

      if (!notes) {
        return ApiResponse.error(res, 404, "Notes not found");
      }

      // Transform to include fileUrl
      const transformedNotes = transformNotes(notes);
      return ApiResponse.success(
        res,
        200,
        "Notes fetched successfully",
        transformedNotes,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update notes
   * PUT /notes/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { unit, title } = req.body;

      const existingNotes = await prisma.notes.findUnique({
        where: { id },
      });

      if (!existingNotes) {
        // Clean up uploaded file if exists
        if (req.file) {
          await FileUtil.deleteFile(req.file.path);
        }
        return ApiResponse.error(res, 404, "Notes not found");
      }

      const updateData = { unit, title };

      // If new file uploaded, delete old file
      if (req.file) {
        await FileUtil.deleteFile(existingNotes.filePath);
        updateData.filePath = getRelativePath(req.file.path);
      }

      const notes = await prisma.notes.update({
        where: { id },
        data: updateData,
      });

      // Invalidate cache
      await cacheService.deleteByPattern(`notes:subject:${notes.subjectId}`);
      await cacheService.delete(
        cacheService.getCacheKey.subject(notes.subjectId),
      );

      return ApiResponse.success(res, 200, "Notes updated successfully", notes);
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await FileUtil.deleteFile(req.file.path);
      }
      next(error);
    }
  }

  /**
   * Delete notes
   * DELETE /notes/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const notes = await prisma.notes.findUnique({
        where: { id },
      });

      if (!notes) {
        return ApiResponse.error(res, 404, "Notes not found");
      }

      // Delete file from disk
      await FileUtil.deleteFile(notes.filePath);

      // Delete from database
      await prisma.notes.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(`notes:subject:${notes.subjectId}`);
      await cacheService.delete(
        cacheService.getCacheKey.subject(notes.subjectId),
      );

      return ApiResponse.success(res, 200, "Notes deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotesController();
