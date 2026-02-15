# 🤖 Adaptive Interview AI

A real-time, AI-powered mock interview platform that adapts to your performance. Built with React (Vite), Node.js, MySQL, and Google Gemini 2.0 Flash.

## ✨ Features
- **Adaptive Difficulty:** Questions get harder as you answer correctly.
- **Real-time AI Feedback:** Instant scoring and feedback on every answer.
- **Voice & Text Modes:** Speak your answers or type them.
- **Detailed Reports:** Comprehensive performance analysis (Strengths, Weaknesses, Improved Answers).
- **Session History:** Track your progress over time.

---

## 🚀 Setup Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd adaptive-interview-ai
```

### 2. Database Setup (MySQL)
1. Create a database named `adaptive_interview_ai`.
2. The tables will be automatically created when you start the server.
3. **IMPORTANT:** You must insert the following API keys into the `master_constant` table for the AI to work.

Run this SQL in your database tool (Workbench/DBeaver):
```sql
USE adaptive_interview_ai;

-- Insert Google Gemini API Key
INSERT INTO master_constant (constant_key, constant_value, status) 
VALUES ('GOOGLE_GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE', 'active');

-- Insert JWT Secret (Optional, defaults to env if missing)
INSERT INTO master_constant (constant_key, constant_value, status) 
VALUES ('JWT_SECRET', 'your-secure-jwt-secret-key-2026', 'active');
```
*(Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key from Google AI Studio)*

### 3. Backend Setup
```bash
cd server
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `server/` folder:
```ini
PORT=5000
NODE_ENV=development

# Database Config
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=adaptive_interview_ai
DB_PORT=3306

# App Config
JWT_EXPIRES_IN=7d
MAX_INTERVIEW_QUESTIONS=5

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Start the Server:**
```bash
# Development Mode (auto-restart)
npm run dev

# Production Mode
npm run start:prod
```

### 4. Frontend Setup
```bash
cd client
npm install
```

**Start the Client:**
```bash
npm run dev
```
Access the app at: `http://localhost:3000`

---

## 📂 Project Structure

```
adaptive-interview-ai/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Application Pages
│   │   ├── store/          # Redux State Management
│   │   └── services/       # API & WebSocket Services
│   └── ...
│
└── server/                 # Node.js Backend
    ├── config/             # Database Connection
    ├── controllers/        # Route Logic
    ├── services/           # Business Logic (AI, Interview)
    ├── routes/             # API Routes
    └── websocketServer.js  # Real-time Communication
```

## 🛠️ Tech Stack
- **Frontend:** React, TailwindCSS, Framer Motion, Redux Toolkit
- **Backend:** Node.js, Express, Socket.io
- **Database:** MySQL
- **AI Model:** Google Gemini 2.0 Flash Lite (via Google GenAI SDK)
