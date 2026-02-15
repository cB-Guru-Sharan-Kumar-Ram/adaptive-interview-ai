import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
    const variants = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4'
    };

    return (
        <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`
        bg-gray-200 dark:bg-gray-700
        ${variants[variant]}
        ${className}
      `}
        />
    );
};
