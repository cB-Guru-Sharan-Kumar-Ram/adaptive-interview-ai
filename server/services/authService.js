const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ConstantLoader = require('../utils/constantLoader');

class AuthService {
  static async register(name, email, password) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND status = ?',
      [email, 'active']
    );

    if (existing.length > 0) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const userId = result.insertId;
    const jwtSecret = await ConstantLoader.getConstant('JWT_SECRET');
    const token = jwt.sign({ userId, email }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: userId,
        name,
        email
      }
    };
  }

  static async login(email, password) {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND status = ?',
      [email, 'active']
    );

    const user = users[0];
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const jwtSecret = await ConstantLoader.getConstant('JWT_SECRET');
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  static async verifyToken(token) {
    const jwtSecret = await ConstantLoader.getConstant('JWT_SECRET');
    return jwt.verify(token, jwtSecret);
  }
}

module.exports = AuthService;
