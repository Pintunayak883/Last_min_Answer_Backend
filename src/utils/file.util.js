const fs = require("fs").promises;
const path = require("path");

class FileUtil {
  /**
   * Safely delete a file from the filesystem
   * @param {string} filePath - Path to the file to delete
   * @returns {Promise<boolean>}
   */
  static async deleteFile(filePath) {
    try {
      if (!filePath) {
        return false;
      }

      // Check if file exists
      await fs.access(filePath);

      // Delete the file
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File not found: ${filePath}`);
        return false;
      }
      console.error(`Error deleting file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Ensure directory exists, create if not
   * @param {string} dirPath - Directory path
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get file extension
   * @param {string} filename
   * @returns {string}
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Generate unique filename
   * @param {string} originalName
   * @returns {string}
   */
  static generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = this.getFileExtension(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;
  }

  /**
   * Validate file type
   * @param {string} mimetype
   * @param {Array<string>} allowedTypes
   * @returns {boolean}
   */
  static isValidFileType(mimetype, allowedTypes) {
    return allowedTypes.includes(mimetype);
  }

  /**
   * Get file size in bytes
   * @param {string} filePath
   * @returns {Promise<number>}
   */
  static async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }
}

module.exports = FileUtil;
