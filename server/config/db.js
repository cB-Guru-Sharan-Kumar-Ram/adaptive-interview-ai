require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS master_constant (
        id INT PRIMARY KEY AUTO_INCREMENT,
        constant_key VARCHAR(100) UNIQUE NOT NULL,
        constant_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        INDEX idx_constant_key (constant_key),
        INDEX idx_status (status)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        INDEX idx_email (email),
        INDEX idx_status (status)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        role VARCHAR(255) NOT NULL,
        interview_type ENUM('technical', 'behavioral', 'mixed') DEFAULT 'technical',
        initial_difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        current_difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        question_count INT DEFAULT 0,
        max_questions INT DEFAULT 5,
        total_duration_minutes INT DEFAULT 0,
        overall_score DECIMAL(5,2) DEFAULT 0,
        report JSON,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        session_id INT NOT NULL,
        question_text TEXT NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
        question_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
        INDEX idx_session_id (session_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL,
        session_id INT NOT NULL,
        answer_text TEXT NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        feedback TEXT,
        is_followup_triggered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        FOREIGN KEY (question_id) REFERENCES questions(id),
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
        INDEX idx_question_id (question_id),
        INDEX idx_session_id (session_id)
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };
