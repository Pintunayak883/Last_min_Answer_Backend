const prisma = require("../config/database");
const cacheService = require("../services/cache.service");
const ApiResponse = require("../utils/response.util");

class SubjectController {
  /**
   * Create subject
   * POST /subjects
   */
  async create(req, res, next) {
    try {
      const { name, code, termId } = req.body;

      if (!termId || !name) {
        return ApiResponse.error(res, 400, "termId and name are required");
      }

      const term = await prisma.term.findUnique({
        where: { id: termId },
        include: { course: true },
      });

      if (!term) {
        return ApiResponse.error(res, 404, "Term not found");
      }

      const subject = await prisma.subject.create({
        data: { name, code, termId },
        include: {
          term: {
            include: {
              course: true,
            },
          },
        },
      });

      // Invalidate cache
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByTerm(termId)
      );
      await cacheService.delete(cacheService.getCacheKey.term(termId));
      await cacheService.delete(cacheService.getCacheKey.course(term.courseId));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByCourse(term.courseId)
      );

      return ApiResponse.success(
        res,
        201,
        "Subject created successfully",
        subject
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subjects
   * GET /subjects?termId=xxx&courseId=xxx
   */
  async getAll(req, res, next) {
    try {
      const { termId, courseId } = req.query;

      if (!termId && !courseId) {
        return ApiResponse.error(
          res,
          400,
          "termId is required; courseId is supported for backward compatibility"
        );
      }

      if (termId) {
        const cacheKey = cacheService.getCacheKey.subjectsByTerm(termId);
        let subjects = await cacheService.get(cacheKey);

        if (!subjects) {
          subjects = await prisma.subject.findMany({
            where: { termId },
            orderBy: { name: "asc" },
            include: {
              term: {
                include: {
                  course: { include: { university: true } },
                },
              },
              _count: {
                select: {
                  syllabus: true,
                  questionPapers: true,
                  notes: true,
                },
              },
            },
          });
          await cacheService.set(cacheKey, subjects);
        }

        return ApiResponse.success(
          res,
          200,
          "Subjects fetched successfully",
          subjects
        );
      }

      // Fallback: course-level query (returns all subjects across terms of the course)
      const courseCacheKey =
        cacheService.getCacheKey.subjectsByCourse(courseId);
      let courseSubjects = await cacheService.get(courseCacheKey);

      if (!courseSubjects) {
        courseSubjects = await prisma.subject.findMany({
          where: { term: { courseId } },
          orderBy: { name: "asc" },
          include: {
            term: {
              include: {
                course: { include: { university: true } },
              },
            },
            _count: {
              select: {
                syllabus: true,
                questionPapers: true,
                notes: true,
              },
            },
          },
        });
        await cacheService.set(courseCacheKey, courseSubjects);
      }

      return ApiResponse.success(
        res,
        200,
        "Subjects fetched successfully",
        courseSubjects
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject by ID
   * GET /subjects/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Check cache
      const cacheKey = cacheService.getCacheKey.subject(id);
      let subject = await cacheService.get(cacheKey);

      if (!subject) {
        subject = await prisma.subject.findUnique({
          where: { id },
          include: {
            term: {
              include: {
                course: {
                  include: { university: true },
                },
              },
            },
            syllabus: true,
            questionPapers: {
              orderBy: { year: "desc" },
            },
            notes: {
              orderBy: { unit: "asc" },
            },
          },
        });

        if (!subject) {
          return ApiResponse.error(res, 404, "Subject not found");
        }

        // Store in cache
        await cacheService.set(cacheKey, subject);
      }

      return ApiResponse.success(
        res,
        200,
        "Subject fetched successfully",
        subject
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subject
   * PUT /subjects/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, code } = req.body;

      const subject = await prisma.subject.update({
        where: { id },
        data: { name, code },
        include: {
          term: {
            include: { course: true },
          },
        },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.subject(id));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByTerm(subject.termId)
      );
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByCourse(subject.term.courseId)
      );
      await cacheService.delete(cacheService.getCacheKey.term(subject.termId));
      await cacheService.delete(
        cacheService.getCacheKey.course(subject.term.courseId)
      );

      return ApiResponse.success(
        res,
        200,
        "Subject updated successfully",
        subject
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete subject
   * DELETE /subjects/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { id },
        select: { termId: true, term: { select: { courseId: true } } },
      });

      if (!subject) {
        return ApiResponse.error(res, 404, "Subject not found");
      }

      await prisma.subject.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.delete(cacheService.getCacheKey.subject(id));
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByTerm(subject.termId)
      );
      await cacheService.deleteByPattern(
        cacheService.getCacheKey.subjectsByCourse(subject.term.courseId)
      );
      await cacheService.delete(cacheService.getCacheKey.term(subject.termId));
      await cacheService.delete(
        cacheService.getCacheKey.course(subject.term.courseId)
      );
      await cacheService.deleteByPattern(`syllabus:subject:${id}`);
      await cacheService.deleteByPattern(`question-papers:subject:${id}`);
      await cacheService.deleteByPattern(`notes:subject:${id}`);

      return ApiResponse.success(res, 200, "Subject deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubjectController();
