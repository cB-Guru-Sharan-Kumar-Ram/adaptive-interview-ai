import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import websocketService from '../services/websocketService';
import VoiceCaptureService from '../services/voiceCaptureService';
import { setInterviewConfig } from '../store/slices/voiceInterviewSlice';
import { Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';

const VoiceInterviewPage = () => {
    const [micEnabled, setMicEnabled] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [audioElement] = useState(new Audio());
    const voiceServiceRef = useRef(null);
    const sessionTimerRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { user } = useSelector((state) => state.auth);
    const {
        avatar,
        transcript,
        questionNumber,
        maxQuestions,
        role,
        difficulty,
        interviewType,
        isComplete
    } = useSelector((state) => state.voiceInterview);

    useEffect(() => {
        if (!user || !location.state) {
            navigate('/dashboard');
            return;
        }

        const config = location.state;
        dispatch(setInterviewConfig(config));

        websocketService.connect();
        initializeVoiceCapture();
        startSessionTimer();

        setTimeout(() => {
            websocketService.startInterview({
                userId: user.id,
                ...config
            });
        }, 1000);

        return () => {
            if (voiceServiceRef.current) {
                voiceServiceRef.current.cleanup();
            }
            if (sessionTimerRef.current) {
                clearInterval(sessionTimerRef.current);
            }
            websocketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (avatar.audio && avatar.state === 'speaking') {
            playAudio(avatar.audio);
        }
    }, [avatar.audio, avatar.state]);

    useEffect(() => {
        if (isComplete) {
            navigate('/feedback');
        }
    }, [isComplete]);

    const playAudio = async (audioData) => {
        try {
            if (typeof audioData === 'string' && audioData.startsWith('{')) {
                const data = JSON.parse(audioData);
                if (data.useBrowserTTS) {
                    speakText(data.text);
                    return;
                }
            }

            audioElement.src = audioData;
            await audioElement.play();
        } catch (error) {
            console.error('Audio playback error:', error);
            if (avatar.text) {
                speakText(avatar.text);
            }
        }
    };

    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const initializeVoiceCapture = async () => {
        voiceServiceRef.current = new VoiceCaptureService((audioChunk) => {
            websocketService.sendVoiceData(audioChunk);
        });

        const success = await voiceServiceRef.current.initialize();
        if (!success) {
            alert('Microphone permission required for voice interview');
        }
    };

    const startSessionTimer = () => {
        sessionTimerRef.current = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);
    };

    const toggleMic = () => {
        if (micEnabled) {
            voiceServiceRef.current.stop();
            websocketService.stopSpeaking();
            setMicEnabled(false);
        } else {
            voiceServiceRef.current.start();
            setMicEnabled(true);
        }
    };

    const endInterview = () => {
        if (confirm('Are you sure you want to end the interview?')) {
            websocketService.endInterview();
            navigate('/dashboard');
        }
    };

    const getAvatarStateColor = () => {
        switch (avatar.state) {
            case 'speaking': return 'bg-green-500';
            case 'listening': return 'bg-blue-500';
            case 'thinking': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <div>
                        <h1 className="text-white font-semibold">{role} Interview</h1>
                        <p className="text-gray-400 text-sm">
                            {difficulty} • {interviewType}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-white">
                        Session: {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Avatar Panel */}
                <div className="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                    {/* Simple Avatar Representation */}
                    <div className="text-center">
                        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl">
                            <div className="text-white text-8xl">🎙️</div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className={`w-3 h-3 rounded-full ${getAvatarStateColor()} animate-pulse`} />
                            <span className="text-white text-lg capitalize">{avatar.state}</span>
                        </div>
                        {avatar.text && (
                            <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                                <p className="text-white text-lg">{avatar.text}</p>
                            </div>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-white text-sm">
                            Question {questionNumber} of {maxQuestions}
                        </p>
                    </div>
                </div>

                {/* Transcript Sidebar */}
                {showTranscript && (
                    <div className="w-96 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
                        <h3 className="text-white font-semibold mb-4">Live Transcript</h3>
                        <div className="space-y-4">
                            {transcript.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg ${item.speaker === 'ai' ? 'bg-blue-900/20' : 'bg-green-900/20'
                                    }`}>
                                    <p className="text-gray-400 text-xs mb-1">
                                        {item.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                                    </p>
                                    <p className="text-white text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
                <div className="flex justify-center items-center space-x-6">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all ${micEnabled
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                        disabled={avatar.state === 'speaking'}
                    >
                        {micEnabled ? (
                            <Mic className="w-6 h-6 text-white" />
                        ) : (
                            <MicOff className="w-6 h-6 text-white" />
                        )}
                    </button>

                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
                    >
                        <MessageSquare className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={endInterview}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
                    >
                        <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-4">
                    {avatar.state === 'speaking' ? 'AI is speaking...' :
                        micEnabled ? 'Listening...' :
                            avatar.state === 'listening' ? 'Click microphone to respond' :
                                'AI is thinking...'}
                </p>
            </div>
        </div>
    );
};

export default VoiceInterviewPage;
