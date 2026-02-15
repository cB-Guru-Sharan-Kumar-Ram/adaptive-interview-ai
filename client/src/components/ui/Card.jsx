import { motion } from 'framer-motion';

export const Card = ({
    children,
    className = '',
    hover = false,
    padding = true,
    ...props
}) => (
    <motion.div
        whileHover={hover ? { y: -4, scale: 1.01 } : {}}
        transition={{ duration: 0.2 }}
        className={`
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl shadow-sm
      transition-shadow duration-200
      ${hover ? 'cursor-pointer hover:shadow-md' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}
        {...props}
    >
        {children}
    </motion.div>
);
