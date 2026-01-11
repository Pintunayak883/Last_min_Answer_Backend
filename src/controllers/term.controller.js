const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const ApiResponse = require("../utils/response.util");

class TermController {
  /**
   * Create term (semester/year)
   * POST /terms
   */
  async create(req, res, next) {
    try {
      const { courseId, type, value, label } = req.body;

      if (!courseId || !type || !value) {
        return ApiResponse.error(
          res,
          400,
          "courseId, type and value are required"
        );
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return ApiResponse.error(res, 404, "Course not found");
      }

      if (course.schemeType !== type) {
        return ApiResponse.error(
          res,
          400,
          `Course schemeType is ${course.schemeType}; term type must match`
        );
      }

      const termLabel =
        label || `${type === "YEAR" ? "Year" : "Semester"} ${value}`;

      const term = await prisma.term.create({
        data: { courseId, type, value: Number(value), label: termLabel },
      });

      await cacheService.delete(cacheService.getCacheKey.term(term.id));
      await cacheService.delete(cacheService.getCacheKey.course(courseId));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.terms(courseId)
      );

      return ApiResponse.success(res, 201, "Term created successfully", term);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get terms by course
   * GET /terms?courseId=xxx
   */
  async getAll(req, res, next) {
    try {
      const { courseId } = req.query;
      if (!courseId) {
        return ApiResponse.error(res, 400, "courseId is required");
      }

      const cacheKey = cacheService.getCacheKey.terms(courseId);
      let terms = await cacheService.get(cacheKey);

      if (!terms) {
        terms = await prisma.term.findMany({
          where: { courseId },
          orderBy: { value: "asc" },
        });
        await cacheService.set(cacheKey, terms);
      }

      return ApiResponse.success(res, 200, "Terms fetched successfully", terms);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get term by id
   * GET /terms/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const cacheKey = cacheService.getCacheKey.term(id);
      let term = await cacheService.get(cacheKey);

      if (!term) {
        term = await prisma.term.findUnique({
          where: { id },
          include: {
            course: true,
            subjects: { orderBy: { name: "asc" } },
          },
        });

        if (!term) {
          return ApiResponse.error(res, 404, "Term not found");
        }

        await cacheService.set(cacheKey, term);
      }

      return ApiResponse.success(res, 200, "Term fetched successfully", term);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update term
   * PUT /terms/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { value, label } = req.body;

      const term = await prisma.term.update({
        where: { id },
        data: {
          ...(value !== undefined ? { value: Number(value) } : {}),
          ...(label !== undefined ? { label } : {}),
        },
      });

      await cacheService.delete(cacheService.getCacheKey.term(id));
      await cacheService.delete(cacheService.getCacheKey.course(term.courseId));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.terms(term.courseId)
      );
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByTerm(id)
      );

      return ApiResponse.success(res, 200, "Term updated successfully", term);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete term
   * DELETE /terms/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const term = await prisma.term.findUnique({
        where: { id },
        select: { courseId: true },
      });

      if (!term) {
        return ApiResponse.error(res, 404, "Term not found");
      }

      await prisma.term.delete({ where: { id } });

      await cacheService.delete(cacheService.getCacheKey.term(id));
      await cacheService.delete(cacheService.getCacheKey.course(term.courseId));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.terms(term.courseId)
      );
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByTerm(id)
      );

      return ApiResponse.success(res, 200, "Term deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TermController();
