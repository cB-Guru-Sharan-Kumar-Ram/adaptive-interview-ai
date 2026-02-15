import { motion } from 'framer-motion';

export const Input = ({
    label,
    error,
    icon,
    helperText,
    className = '',
    ...props
}) => (
    <div className="space-y-2">
        {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
                className={`
          w-full px-4 py-2.5 rounded-lg border-2 
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          transition-all duration-200
          ${icon ? 'pl-10' : ''}
          ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                    }
          focus:outline-none
          ${className}
        `}
                {...props}
            />
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
                {error}
            </motion.p>
        )}
        {helperText && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
    </div>
);
