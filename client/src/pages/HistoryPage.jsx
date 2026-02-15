import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Target, Trophy, ChevronRight, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function HistoryPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState(null);
    const [sessionQA, setSessionQA] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await axiosInstance.get('/interview/history');
            setSessions(response.data.sessions || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessionQA = async (sessionId) => {
        if (sessionQA[sessionId]) {
            return; // Already loaded
        }

        try {
            const response = await axiosInstance.get(`/interview/session/${sessionId}/qa`);
            setSessionQA(prev => ({
                ...prev,
                [sessionId]: response.data.qa || []
            }));
        } catch (error) {
            console.error('Failed to fetch Q&A:', error);
        }
    };

    const toggleSession = async (sessionId) => {
        if (expandedSession === sessionId) {
            setExpandedSession(null);
        } else {
            setExpandedSession(sessionId);
            await fetchSessionQA(sessionId);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[difficulty?.toLowerCase()] || colors.medium;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (loading) {
        return (
            <DashboardLayout title="Interview History">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Interview History">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Interview History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View your past interviews and performance reports
                    </p>
                </div>

                {/* Sessions List */}
                {sessions.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <FileText size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Interview History
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You haven't completed any interviews yet.
                        </p>
                        <Button onClick={() => navigate('/dashboard')}>
                            Start Your First Interview
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Card className="overflow-hidden">
                                    {/* Session Header */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {session.role}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                                            session.initial_difficulty
                                                        )}`}
                                                    >
                                                        {session.initial_difficulty}
                                                    </span>
                                                    {session.status === 'completed' && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Calendar size={16} />
                                                        <span>{formatDate(session.created_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Target size={16} />
                                                        <span>{session.interview_type || 'Technical'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <FileText size={16} />
                                                        <span>{session.question_count || 0} Questions</span>
                                                    </div>
                                                    {session.overall_score !== null && (
                                                        <div className="flex items-center gap-2">
                                                            <Trophy size={16} className="text-yellow-500" />
                                                            <span className={`font-semibold ${getScoreColor(session.overall_score)}`}>
                                                                Score: {session.overall_score}/100
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleSession(session.id)}
                                                    className="gap-2"
                                                >
                                                    {expandedSession === session.id ? (
                                                        <>
                                                            Hide Q&A
                                                            <ChevronUp size={16} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            View Q&A
                                                            <ChevronDown size={16} />
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/results/${session.id}`)}
                                                >
                                                    View Report
                                                    <ChevronRight size={16} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Q&A Section */}
                                    <AnimatePresence>
                                        {expandedSession === session.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                            >
                                                <div className="p-6 space-y-4">
                                                    {sessionQA[session.id]?.length > 0 ? (
                                                        sessionQA[session.id].map((qa, index) => (
                                                            <div
                                                                key={qa.question_id}
                                                                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                                            >
                                                                <div className="flex items-start gap-3 mb-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                                                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                                            #{index + 1}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                                                            Q: {qa.question_text}
                                                                        </p>
                                                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded border-l-4 border-blue-500">
                                                                            A: {qa.answer_text || 'No answer provided'}
                                                                        </p>
                                                                        {qa.score !== null && (
                                                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                                                <span className={`font-semibold ${getScoreColor(qa.score)}`}>
                                                                                    Score: {qa.score}/100
                                                                                </span>
                                                                                {qa.feedback && (
                                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                                        {qa.feedback}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">
                                                            Loading Q&A...
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
