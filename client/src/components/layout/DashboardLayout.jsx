import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Play, History,
    ChevronLeft, Menu, Moon, Sun, LogOut
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Play, label: 'Start Interview', path: '/dashboard' },
    { icon: History, label: 'History', path: '/history' },
];

export const DashboardLayout = ({ children, title = 'Dashboard' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 256 }}
                className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                    {!collapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                            InterviewAI
                        </span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {collapsed ? <Menu size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <motion.a
                            key={item.path}
                            href={item.path}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <item.icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                        </motion.a>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        {!collapsed && <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <div className="flex items-center gap-4">
                        {/* User Avatar */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white font-medium">
                                {getInitials(user?.name)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};
