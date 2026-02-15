const { pool } = require('../config/db');

const constantCache = {};
const cacheTTL = 5 * 60 * 1000;

class ConstantLoader {
  static async getConstant(constantKey) {
    const cached = constantCache[constantKey];
    
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.value;
    }

    try {
      const [rows] = await pool.query(
        'SELECT constant_value FROM master_constant WHERE constant_key = ? AND status = ?',
        [constantKey, 'active']
      );

      if (rows.length === 0) {
        throw new Error(`Configuration constant not found: ${constantKey}`);
      }

      const value = rows[0].constant_value;
      constantCache[constantKey] = {
        value,
        timestamp: Date.now()
      };
      
      return value;
    } catch (error) {
      console.error(`Error loading constant: ${constantKey}`);
      throw error;
    }
  }

  static clearCache(constantKey = null) {
    if (constantKey) {
      delete constantCache[constantKey];
    } else {
      Object.keys(constantCache).forEach(key => delete constantCache[key]);
    }
  }

  static async refreshConstant(constantKey) {
    this.clearCache(constantKey);
    return await this.getConstant(constantKey);
  }
}

module.exports = ConstantLoader;
