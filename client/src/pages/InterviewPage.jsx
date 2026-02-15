import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitAnswerRequest, submitAnswerSuccess, submitAnswerFailure } from '../store/slices/interviewSlice';
import axiosInstance from '../api/axiosInstance';

const InterviewPage = () => {
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const [sessionTime, setSessionTime] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentSession, currentQuestion, loading } = useSelector((state) => state.interview);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const sessionTimerRef = useRef(null);

    useEffect(() => {
        if (!currentSession || !currentQuestion) {
            navigate('/dashboard');
            return;
        }

        startTimer();
        initSpeechRecognition();

        if (!sessionTimerRef.current) {
            sessionTimerRef.current = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [currentQuestion]);

    useEffect(() => {
        return () => {
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        };
    }, []);

    const startTimer = () => {
        setTimeLeft(180);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const initSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setAnswer((prev) => prev + ' ' + transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleAutoSubmit = async () => {
        if (!answer.trim()) return;
        await handleSubmit();
    };

    const handleSubmit = async () => {
        if (!answer.trim() || loading) return;

        if (timerRef.current) clearInterval(timerRef.current);

        dispatch(submitAnswerRequest());

        try {
            const response = await axiosInstance.post('/interview/answer', {
                sessionId: currentSession.sessionId,
                questionId: currentQuestion.questionId,
                answer: answer.trim()
            });

            dispatch(submitAnswerSuccess(response.data));

            if (response.data.completed) {
                navigate('/feedback');
            } else {
                setAnswer('');
                startTimer();
            }
        } catch (err) {
            dispatch(submitAnswerFailure(err.response?.data?.error || 'Failed to submit answer'));
        }
    };

    if (!currentQuestion) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-sm font-medium text-gray-600">
                                Question {currentQuestion.questionNumber} of {currentQuestion.maxQuestions || currentSession.maxQuestions} •
                                {currentQuestion.difficulty.toUpperCase()} •
                                {(currentSession.interviewType || 'technical').toUpperCase()}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Session Time: {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
                            </p>
                        </div>
                        <div className={`text-3xl font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="bg-primary-50 rounded-lg p-6 border-l-4 border-primary-600">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Question</h3>
                            <p className="text-gray-700 text-lg leading-relaxed">{currentQuestion.question}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                            {recognitionRef.current && (
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isRecording
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                    </svg>
                                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                                </button>
                            )}
                        </div>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="input-field min-h-[200px] resize-none"
                            placeholder="Type or record your answer here..."
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Answer will auto-submit when time runs out</p>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={loading || !answer.trim()}
                        >
                            {loading ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;
