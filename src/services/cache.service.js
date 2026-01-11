const { getRedisClient } = require("../config/redis");
const config = require("../config/config");

class CacheService {
  /**
   * Get data from cache
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set data in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = config.redis.cacheTTL) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  /**
   * Delete cache by key
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  /**
   * Delete cache by pattern
   * @param {string} pattern - Pattern to match keys (e.g., 'universities:*')
   * @returns {Promise<void>}
   */
  async deleteByPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);

      if (keys.length > 0) {
        await client.del(keys);
        console.log(
          `Deleted ${keys.length} cache keys matching pattern: ${pattern}`
        );
      }
    } catch (error) {
      console.error("Cache deleteByPattern error:", error);
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      const client = getRedisClient();
      await client.flushAll();
      console.log("All cache cleared");
    } catch (error) {
      console.error("Cache clearAll error:", error);
    }
  }

  // Predefined cache key generators
  getCacheKey = {
    universities: () => "universities:all",
    university: (id) => `university:${id}`,
    courses: (universityId) => `courses:university:${universityId}`,
    course: (id) => `course:${id}`,
    terms: (courseId) => `terms:course:${courseId}`,
    term: (id) => `term:${id}`,
    // Legacy course-level subject cache kept for backward compatibility during transition
    subjectsByCourse: (courseId) => `subjects:course:${courseId}`,
    subjectsByTerm: (termId) => `subjects:term:${termId}`,
    subject: (id) => `subject:${id}`,
    syllabus: (subjectId) => `syllabus:subject:${subjectId}`,
    questionPapers: (subjectId) => `question-papers:subject:${subjectId}`,
    notes: (subjectId) => `notes:subject:${subjectId}`,
  };
}

module.exports = new CacheService();
