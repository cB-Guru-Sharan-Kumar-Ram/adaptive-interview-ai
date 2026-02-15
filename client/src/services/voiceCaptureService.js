class VoiceCaptureService {
  constructor(onDataAvailable) {
    this.mediaRecorder = null;
    this.stream = null;
    this.onDataAvailable = onDataAvailable;
    this.isRecording = false;
  }

  async initialize() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.onDataAvailable(event.data);
        }
      });

      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  }

  start() {
    if (this.mediaRecorder && !this.isRecording) {
      this.mediaRecorder.start(100);
      this.isRecording = true;
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}

export default VoiceCaptureService;
