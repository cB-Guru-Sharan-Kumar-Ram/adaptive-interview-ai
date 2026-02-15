const ConstantLoader = require('../utils/constantLoader');

let GoogleGenAI;
let cachedClient = null;
let cachedModelName = null;

async function loadGeminiSDK() {
  if (!GoogleGenAI) {
    const module = await import('@google/genai');
    GoogleGenAI = module.GoogleGenAI;
  }
  return GoogleGenAI;
}

async function getGeminiClient() {
  if (cachedClient) return cachedClient;

  const GenAI = await loadGeminiSDK();
  const apiKey = await ConstantLoader.getConstant('GOOGLE_GEMINI_API_KEY');
  
  if (!apiKey || apiKey.trim() === '') {
    const err = new Error('Gemini API key not configured.');
    err.statusCode = 500;
    err.errorCode = 'GEMINI_KEY_MISSING';
    throw err;
  }

  process.env.GEMINI_API_KEY = apiKey.trim();
  cachedClient = new GenAI({});
  return cachedClient;
}

function getModelName() {
  if (!cachedModelName) {
    cachedModelName = 'gemini-2.0-flash';
  }
  return cachedModelName;
}

async function callGemini(prompt) {
  const ai = await getGeminiClient();
  const model = getModelName();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    const text = response?.text;
    if (!text) {
      const err = new Error('Empty AI response.');
      err.statusCode = 500;
      err.errorCode = 'GEMINI_INVALID_RESPONSE';
      throw err;
    }
    return text;
  } catch (error) {
    if (error.errorCode) throw error;

    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('api key') || msg.includes('unauthorized')) {
      const err = new Error('Gemini authentication failed.');
      err.statusCode = 500;
      err.errorCode = 'GEMINI_AUTH_FAILED';
      throw err;
    }
    if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('429')) {
      const err = new Error('Gemini rate limit exceeded.');
      err.statusCode = 429;
      err.errorCode = 'GEMINI_RATE_LIMIT';
      throw err;
    }
    if (msg.includes('not found') || msg.includes('404')) {
      const err = new Error('Gemini model not found.');
      err.statusCode = 500;
      err.errorCode = 'GEMINI_MODEL_ERROR';
      throw err;
    }

    const err = new Error('Gemini service error.');
    err.statusCode = 500;
    err.errorCode = 'GEMINI_ERROR';
    throw err;
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    const err = new Error('Invalid AI response format.');
    err.statusCode = 500;
    err.errorCode = 'INVALID_JSON_RESPONSE';
    throw err;
  }
}

class OpenAIService {
  static async generateFirstQuestion(role, difficulty) {
    const prompt = `You are an expert technical interviewer conducting a ${difficulty} level interview for a ${role} position.
      Generate ONE technical interview question appropriate for this role and difficulty level.
      Return ONLY the question text, no additional commentary.`;
    const text = await callGemini(prompt);
    return text.trim();
  }

  static async evaluateAndGenerateNext(question, answer, difficulty, role, interviewType, previousQA, avgScore, isLastQuestion) {
    const qaContext = previousQA.length > 0 
      ? previousQA.map((qa, i) => 
          `Q${i + 1}: ${qa.question_text}\nA${i + 1}: ${qa.answer_text} (Score: ${qa.score})`
        ).join('\n')
      : 'No previous questions.';

    const nextInstruction = isLastQuestion 
      ? '' 
      : `\n3. Generate ONE new ${difficulty} level ${interviewType} question for a ${role} position that:
      - Does NOT repeat previous questions
      - Covers a different aspect
      - Adapts to candidate performance (avg: ${avgScore.toFixed(0)}%)
      Include as "nextQuestion" in the JSON.`;

    const jsonFormat = isLastQuestion
      ? '{"score": <0-100>, "feedback": "<2 sentences>"}'
      : '{"score": <0-100>, "feedback": "<2 sentences>", "nextQuestion": "<new question text>"}';

    const prompt = `Evaluate this interview answer and respond in JSON.
          Question: ${question}
          Answer: ${answer}
          Difficulty: ${difficulty}

          Previous context:
          ${qaContext}
          ${nextInstruction}

          Return ONLY this JSON (no markdown):
          ${jsonFormat}`;

    const text = await callGemini(prompt);
    return safeParseJSON(text);
  }

  static async generateReport(sessionData, answers) {
    const qaContext = answers.map((a, i) => 
      `Q${i + 1}: ${a.question_text}\nA${i + 1}: ${a.answer_text}\nScore: ${a.score}`
    ).join('\n\n');

    const prompt = `Analyze this interview session and generate a performance report.

      Role: ${sessionData.role}
      Difficulty: ${sessionData.initial_difficulty}
      Overall Score: ${sessionData.overall_score}

      Questions and Answers:
      ${qaContext}

      Return this exact JSON format:
      {
        "overall_score": <average score>,
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "improvements": ["improvement 1", "improvement 2", "improvement 3"],
        "improved_sample_answers": [
          {"question": "<question>", "improved_answer": "<improved version>"},
          {"question": "<question>", "improved_answer": "<improved version>"}
        ],
        "suggested_topics": ["topic 1", "topic 2"]
      }`;

    const text = await callGemini(prompt);
    return safeParseJSON(text);
  }
}

module.exports = OpenAIService;
