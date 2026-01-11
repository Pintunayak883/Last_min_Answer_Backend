const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const ApiResponse = require("../utils/response.util");

class UniversityController {
  /**
   * Create university
   * POST /universities
   */
  async create(req, res, next) {
    try {
      const { name, code } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return ApiResponse.error(res, 400, "University name is required");
      }

      const university = await prisma.university.create({
        data: { name: name.trim(), code: code?.trim() || null },
      });

      // Invalidate cache
      await cacheService.deleteByPattern("universities:*");

      return ApiResponse.success(
        res,
        201,
        "University created successfully",
        university
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all universities
   * GET /universities
   */
  async getAll(req, res, next) {
    try {
      // Check cache first
      const cacheKey = cacheService.getCacheKey.universities();
      let universities = await cacheService.get(cacheKey);

      if (!universities) {
        universities = await prisma.university.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { courses: true },
            },
          },
        });

        // Store in cache
        await cacheService.set(cacheKey, universities);
      }

      return ApiResponse.success(
        res,
        200,
        "Universities fetched successfully",
        universities
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get university by ID
   * GET /universities/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Check cache first
      const cacheKey = cacheService.getCacheKey.university(id);
      let university = await cacheService.get(cacheKey);

      if (!university) {
        university = await prisma.university.findUnique({
          where: { id },
          include: {
            courses: {
              orderBy: { name: "asc" },
            },
          },
        });

        if (!university) {
          return ApiResponse.error(res, 404, "University not found");
        }

        // Store in cache
        await cacheService.set(cacheKey, university);
      }

      return ApiResponse.success(
        res,
        200,
        "University fetched successfully",
        university
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update university
   * PUT /universities/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code } = req.body;

      const university = await prisma.university.update({
        where: { id },
        data: { name, code },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.university(id));
      await cacheService.deleteByPattern("universities:*");

      return ApiResponse.success(
        res,
        200,
        "University updated successfully",
        university
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete university
   * DELETE /universities/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.university.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.university(id));
      await cacheService.deleteByPattern("universities:*");
      await cacheService.deleteByPattern("courses:*");

      return ApiResponse.success(res, 200, "University deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UniversityController();
