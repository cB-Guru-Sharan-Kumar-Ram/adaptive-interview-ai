import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const { report } = useSelector((state) => state.interview);

    useEffect(() => {
        if (!report) {
            navigate('/dashboard');
        }
    }, [report, navigate]);

    if (!report) return null;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Interview Complete!</h1>
                    <p className="text-gray-600 mt-2">Here's your detailed performance report</p>
                </div>

                <div className="card mb-8">
                    <div className="flex flex-col items-center">
                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBg(report.overall_score)} flex items-center justify-center mb-4`}>
                            <div className="text-white text-center">
                                <p className="text-4xl font-bold">{report.overall_score}</p>
                                <p className="text-sm">out of 100</p>
                                <p className="text-xs mt-1">({report.overall_score_out_of_10 || (report.overall_score / 10).toFixed(1)} / 10)</p>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${getScoreColor(report.overall_score)}`}>
                            {report.overall_score >= 80 ? 'Excellent!' : report.overall_score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                        </p>
                        {report.session_duration_minutes && (
                            <p className="text-sm text-gray-600 mt-2">
                                Completed in {report.session_duration_minutes} minutes
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Strengths
                        </h2>
                        <ul className="space-y-2">
                            {report.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span className="text-gray-700">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Areas for Improvement
                        </h2>
                        <ul className="space-y-2">
                            {report.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-600 mr-2">→</span>
                                    <span className="text-gray-700">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="card mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Improved Sample Answers</h2>
                    <div className="space-y-6">
                        {report.improved_sample_answers.map((sample, index) => (
                            <div key={index} className="border-l-4 border-primary-600 pl-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{sample.question}</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 leading-relaxed">{sample.improved_answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested Practice Topics</h2>
                    <div className="flex flex-wrap gap-2">
                        {report.suggested_topics.map((topic, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary"
                    >
                        Start New Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
