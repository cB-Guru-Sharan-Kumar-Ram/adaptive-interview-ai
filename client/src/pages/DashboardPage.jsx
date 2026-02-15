import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Play } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { clearInterview, loadHistorySuccess, startInterviewRequest, startInterviewSuccess, startInterviewFailure } from '../store/slices/interviewSlice';
import axiosInstance from '../api/axiosInstance';

const stats = [
    { label: 'Total Interviews', key: 'total', icon: Clock, color: 'primary' },
    { label: 'Average Score', key: 'avgScore', icon: Target, color: 'purple' },
    { label: 'Highest Score', key: 'highest', icon: TrendingUp, color: 'green' },
];

export default function DashboardPage() {
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [interviewType, setInterviewType] = useState('technical');
    const [maxQuestions, setMaxQuestions] = useState(5);
    const [interviewMode, setInterviewMode] = useState('text');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { loading, history } = useSelector((state) => state.interview);

    useEffect(() => {
        loadHistory();
        dispatch(clearInterview());
    }, []);

    const loadHistory = async () => {
        try {
            const response = await axiosInstance.get('/interview/history');
            dispatch(loadHistorySuccess(response.data.sessions || response.data || []));
        } catch (err) {
            console.error('Failed to load history');
        }
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        if (!role.trim()) return;

        if (interviewMode === 'voice') {
            navigate('/voice-interview', {
                state: { role, difficulty, interviewType, maxQuestions }
            });
            return;
        }

        dispatch(startInterviewRequest());
        try {
            const response = await axiosInstance.post('/interview/start', {
                role, difficulty, interviewType, maxQuestions
            });
            dispatch(startInterviewSuccess(response.data));
            navigate('/interview');
        } catch (err) {
            dispatch(startInterviewFailure(err.message || 'Failed to start interview'));
        }
    };

    const statsData = {
        total: history.length,
        avgScore: history.length > 0
            ? (history.reduce((sum, h) => sum + (parseFloat(h.overallScore) || 0), 0) / history.length).toFixed(1)
            : 0,
        highest: history.length > 0
            ? Math.max(...history.map(h => parseFloat(h.overallScore) || 0))
            : 0
    };

    return (
        <DashboardLayout title="Dashboard">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                {/* Welcome */}
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                        Welcome back, {user?.name || 'User'}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Ready to continue your interview practice?
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                            <Icon className="text-primary-600 dark:text-primary-400" size={24} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stat.key === 'avgScore' || stat.key === 'highest'
                                            ? `${statsData[stat.key]}%`
                                            : statsData[stat.key]
                                        }
                                    </p>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Start Interview Section */}
                <Card>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Start New Interview</h3>
                    <form onSubmit={handleStartInterview} className="space-y-6">
                        {/* Interview Mode Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Interview Mode
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    type="button"
                                    onClick={() => setInterviewMode('text')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                    py-4 px-6 rounded-lg border-2 transition-all text-left
                    ${interviewMode === 'text'
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }
                  `}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white">💬 Text Interview</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Type your answers</p>
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={() => setInterviewMode('voice')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                    py-4 px-6 rounded-lg border-2 transition-all text-left
                    ${interviewMode === 'voice'
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }
                  `}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white">🎙️ Voice Interview</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Speak your answers</p>
                                </motion.button>
                            </div>
                        </div>

                        {/* Role Input */}
                        <Input
                            label="Role/Position"
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Frontend Developer, Data Scientist"
                            required
                        />

                        {/* Difficulty Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['beginner', 'medium', 'advanced'].map((level) => (
                                    <motion.button
                                        key={level}
                                        type="button"
                                        onClick={() => setDifficulty(level)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                      py-3 px-4 rounded-lg border-2 transition-all capitalize
                      ${difficulty === level
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                            }
                    `}
                                    >
                                        {level}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Interview Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Interview Type
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['technical', 'behavioral', 'mixed'].map((type) => (
                                    <motion.button
                                        key={type}
                                        type="button"
                                        onClick={() => setInterviewType(type)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                      py-3 px-4 rounded-lg border-2 transition-all capitalize
                      ${interviewType === type
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                            }
                    `}
                                    >
                                        {type}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Number of Questions: {maxQuestions}
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="10"
                                value={maxQuestions}
                                onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>3</span>
                                <span>10</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            <Play size={20} className="mr-2" />
                            {loading ? 'Starting...' : 'Start Interview'}
                        </Button>
                    </form>
                </Card>

                {/* Recent Sessions */}
                {history.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Recent Sessions
                        </h3>
                        <div className="space-y-4">
                            {history.slice(0, 3).map((session, i) => (
                                <Card key={i} hover>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {session.role}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {(() => {
                                                    const d = new Date(session.createdAt || session.startedAt || session.created_at);
                                                    return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                                })()} · {session.difficulty}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {session.overallScore}%
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
