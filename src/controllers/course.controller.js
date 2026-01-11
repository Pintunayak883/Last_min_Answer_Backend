const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const ApiResponse = require("../utils/response.util");

class CourseController {
  /**
   * Create course
   * POST /courses
   */
  async create(req, res, next) {
    try {
      const { name, code, universityId, schemeType = "SEMESTER" } = req.body;

      const course = await prisma.course.create({
        data: { name, code, universityId, schemeType },
        include: { university: true },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(`courses:university:${universityId}`);
      await cacheService.delete(
        cacheService.getCacheKey.university(universityId)
      );

      return ApiResponse.success(
        res,
        201,
        "Course created successfully",
        course
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all courses (optionally filter by university)
   * GET /courses?universityId=xxx
   */
  async getAll(req, res, next) {
    try {
      const { universityId } = req.query;

      const where = universityId ? { universityId } : {};

      // Check cache
      const cacheKey = universityId
        ? cacheService.getCacheKey.courses(universityId)
        : "courses:all";
      let courses = await cacheService.get(cacheKey);

      if (!courses) {
        courses = await prisma.course.findMany({
          where,
          orderBy: { name: "asc" },
          include: {
            university: true,
            _count: {
              select: { terms: true },
            },
          },
        });

        // Store in cache
        await cacheService.set(cacheKey, courses);
      }

      return ApiResponse.success(
        res,
        200,
        "Courses fetched successfully",
        courses
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get course by ID
   * GET /courses/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Check cache
      const cacheKey = cacheService.getCacheKey.course(id);
      let course = await cacheService.get(cacheKey);

      if (!course) {
        course = await prisma.course.findUnique({
          where: { id },
          include: {
            university: true,
            terms: {
              orderBy: { value: "asc" },
              include: {
                subjects: { orderBy: { name: "asc" } },
              },
            },
          },
        });

        if (!course) {
          return ApiResponse.error(res, 404, "Course not found");
        }

        // Store in cache
        await cacheService.set(cacheKey, course);
      }

      return ApiResponse.success(
        res,
        200,
        "Course fetched successfully",
        course
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update course
   * PUT /courses/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code, schemeType } = req.body;

      if (schemeType) {
        const existing = await prisma.course.findUnique({
          where: { id },
          include: { _count: { select: { terms: true } }, terms: { take: 1 } },
        });
        if (!existing) {
          return ApiResponse.error(res, 404, "Course not found");
        }
        if (schemeType !== existing.schemeType && existing._count.terms > 0) {
          return ApiResponse.error(
            res,
            400,
            "Cannot change schemeType while terms exist for this course"
          );
        }
      }

      const course = await prisma.course.update({
        where: { id },
        data: { name, code, ...(schemeType ? { schemeType } : {}) },
        include: { university: true },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.course(id));
      await cacheService.deleteByPattern(
        `courses:university:${course.universityId}`
      );
      await cacheService.deleteByPattern("courses:all");
      await cacheService.delete(cacheService.getCacheKey.terms(id));

      return ApiResponse.success(
        res,
        200,
        "Course updated successfully",
        course
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete course
   * DELETE /courses/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id },
        select: { universityId: true },
      });

      if (!course) {
        return ApiResponse.error(res, 404, "Course not found");
      }

      const termIds = await prisma.term.findMany({
        where: { courseId: id },
        select: { id: true },
      });

      await prisma.course.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.course(id));
      await cacheService.deleteByPattern(
        `courses:university:${course.universityId}`
      );
      await cacheService.deleteByPattern("courses:all");
      await cacheService.delete(cacheService.getCacheKey.terms(id));
      for (const term of termIds) {
        await cacheService.delete(cacheService.getCacheKey.term(term.id));
        await cacheService.delete(
          cacheService.getCacheKey.subjectsByTerm(term.id)
        );
      }
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByCourse(id)
      );

      return ApiResponse.success(res, 200, "Course deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
