class VoiceService {
  static createSTTStream(onTranscript) {
    let transcript = '';
    let buffer = [];

    return {
      send: (audioChunk) => {
        buffer.push(audioChunk);
      },
      finalize: async () => {
        return transcript || 'Sample transcribed answer';
      },
      close: () => {
        buffer = [];
      }
    };
  }

  static async textToSpeech(text) {
    return JSON.stringify({ text, useBrowserTTS: true });
  }
}

module.exports = VoiceService;
