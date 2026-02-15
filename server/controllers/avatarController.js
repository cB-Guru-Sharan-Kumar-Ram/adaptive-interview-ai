class AvatarController {
  static generateVisemes(text) {
    const phonemeMap = {
      'A': ['a', 'ah', 'aa'],
      'E': ['e', 'eh', 'ae'],
      'I': ['i', 'ih', 'iy'],
      'O': ['o', 'oh', 'ao'],
      'U': ['u', 'uh', 'uw'],
      'M': ['m'],
      'F': ['f', 'v'],
      'TH': ['th', 'dh'],
      'S': ['s', 'z', 'sh', 'zh'],
      'L': ['l'],
      'R': ['r'],
      'W': ['w']
    };

    const words = text.toLowerCase().split(' ');
    const visemes = [];
    let time = 0;

    words.forEach(word => {
      const duration = word.length * 0.08;
      visemes.push({
        viseme: this.mapWordToViseme(word, phonemeMap),
        time: time,
        duration: duration
      });
      time += duration + 0.05;
    });

    return visemes;
  }

  static mapWordToViseme(word, phonemeMap) {
    const firstChar = word[0].toUpperCase();
    if (phonemeMap[firstChar]) {
      return firstChar;
    }
    return 'A';
  }

  static getEmotionParameters(emotion) {
    const emotions = {
      'friendly': { eyebrows: 0.3, smile: 0.6, eyeOpenness: 0.9 },
      'professional': { eyebrows: 0, smile: 0.2, eyeOpenness: 0.8 },
      'positive': { eyebrows: 0.4, smile: 0.8, eyeOpenness: 1.0 },
      'encouraging': { eyebrows: 0.2, smile: 0.5, eyeOpenness: 0.85 },
      'thinking': { eyebrows: -0.1, smile: 0, eyeOpenness: 0.7 }
    };

    return emotions[emotion] || emotions['professional'];
  }
}

module.exports = AvatarController;
