import { motion } from 'framer-motion'

const AnimatedCard = ({ children, className = '', delay = 0, ...rest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 100,
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
