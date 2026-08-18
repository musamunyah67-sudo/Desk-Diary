import { motion } from 'framer-motion'

const AnimatedCard = ({ children, className = '', delay = 0, ...rest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.92, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 120,
        damping: 14,
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: [0, -1, 1, -1, 1, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard
