import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trophy, TrendingUp, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axiosInstance from '../api/axiosInstance';

export default function ResultsPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [session, setSession] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [sessionId]);

    const fetchReport = async () => {
        try {
            const response = await axiosInstance.get(`/interview/results/${sessionId}`);
            setReport(response.data.report);
            setSession(response.data.session);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        return 'Needs Improvement';
    };

    if (loading) {
        return (
            <DashboardLayout title="Performance Report">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!report || !session) {
        return (
            <DashboardLayout title="Performance Report">
                <Card className="p-12 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold mb-2">Report Not Found</h3>
                    <Button onClick={() => navigate('/history')}>Back to History</Button>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Performance Report">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/history')}
                        className="gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to History
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download size={16} />
                        Export PDF
                    </Button>
                </div>

                {/* Session Info */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {session.role} Interview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Difficulty</p>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {session.initial_difficulty}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Type</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {session.interview_type || 'Technical'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Questions</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {session.questions_count || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {new Date(session.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Overall Score */}
                <Card className="p-8 text-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                    <Trophy size={48} className="mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Overall Score
                    </h3>
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(report.overall_score)}`}>
                        {report.overall_score}
                        <span className="text-3xl">/100</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        {getScoreGrade(report.overall_score)}
                    </p>
                </Card>

                {/* Strengths */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Strengths
                        </h3>
                    </div>
                    <ul className="space-y-3">
                        {report.strengths?.map((strength, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                            >
                                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    {index + 1}
                                </span>
                                <span>{strength}</span>
                            </motion.li>
                        ))}
                    </ul>
                </Card>

                {/* Improvement Areas */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Areas for Improvement
                        </h3>
                    </div>
                    <ul className="space-y-3">
                        {report.improvements?.map((improvement, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                            >
                                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    {index + 1}
                                </span>
                                <span>{improvement}</span>
                            </motion.li>
                        ))}
                    </ul>
                </Card>

                {/* Improved Sample Answers */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Improved Sample Answers
                    </h3>
                    <div className="space-y-6">
                        {report.improved_sample_answers?.map((sample, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-l-4 border-primary-500 pl-4"
                            >
                                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Q: {sample.question}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    {sample.improved_answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Suggested Topics */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Lightbulb size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Suggested Next Practice Topics
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {report.suggested_topics?.map((topic, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                            >
                                {topic}
                            </motion.span>
                        ))}
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center pb-8">
                    <Button onClick={() => navigate('/dashboard')} size="lg">
                        Start New Interview
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/history')} size="lg">
                        View All History
                    </Button>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
