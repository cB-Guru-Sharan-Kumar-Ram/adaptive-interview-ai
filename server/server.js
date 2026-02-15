require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initDatabase } = require('./config/db');
const WebSocketServer = require('./websocketServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDatabase();
    
    const httpServer = http.createServer(app);
    
    // Initialize WebSocket server
    new WebSocketServer(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
