import { io } from 'socket.io-client';
import { store } from '../store/store';
import { 
  avatarSpeak, 
  avatarListen, 
  avatarThink,
  updateTranscript,
  interviewComplete 
} from '../store/slices/voiceInterviewSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('avatar-speak', (data) => {
      store.dispatch(avatarSpeak(data));
    });

    this.socket.on('avatar-listening', () => {
      store.dispatch(avatarListen());
    });

    this.socket.on('avatar-thinking', () => {
      store.dispatch(avatarThink());
    });

    this.socket.on('transcript-update', (data) => {
      store.dispatch(updateTranscript(data));
    });

    this.socket.on('interview-complete', (data) => {
      store.dispatch(interviewComplete(data));
    });

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data.message);
    });
  }

  startInterview(config) {
    if (this.socket) {
      this.socket.emit('start-interview', config);
    }
  }

  sendVoiceData(audioChunk) {
    if (this.socket) {
      this.socket.emit('voice-data', audioChunk);
    }
  }

  stopSpeaking() {
    if (this.socket) {
      this.socket.emit('stop-speaking');
    }
  }

  endInterview() {
    if (this.socket) {
      this.socket.emit('end-interview');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new WebSocketService();
