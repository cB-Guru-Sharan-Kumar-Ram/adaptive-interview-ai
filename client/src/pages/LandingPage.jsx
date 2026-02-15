import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Target, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
    {
        icon: Target,
        title: 'Select Role & Difficulty',
        description: 'Choose your target position and skill level'
    },
    {
        icon: Zap,
        title: 'AI Adaptive Interview',
        description: 'Practice with our intelligent interviewer'
    },
    {
        icon: Award,
        title: 'Performance Report',
        description: 'Get detailed feedback and insights'
    }
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-6 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
                        >
                            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                AI-Powered Interview Practice
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                            Practice Technical
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Interviews with AI
                            </span>
                        </h1>

                        {/* Subtext */}
                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Adaptive mock interviews that adjust to your skill level.
                            Get instant feedback and improve faster.
                        </p>

                        {/* CTAs */}
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button
                                size="xl"
                                onClick={() => navigate('/register')}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outline"
                                size="xl"
                                onClick={() => navigate('/login')}
                                className="border-white/20 hover:bg-white/5"
                            >
                                Sign In
                            </Button>
                        </div>
                    </motion.div>
                </section>

                {/* How It Works */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-center mb-16"
                        >
                            How It Works
                        </motion.h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                                        <step.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 py-12">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                InterviewAI
                            </div>
                            <div className="flex gap-6 text-sm text-gray-400">
                                <a href="/login" className="hover:text-white transition-colors">Sign In</a>
                                <a href="/register" className="hover:text-white transition-colors">Sign Up</a>
                            </div>
                        </div>
                        <div className="text-center mt-8 text-sm text-gray-500">
                            © 2026 InterviewAI. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
