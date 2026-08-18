import { motion } from 'framer-motion'

const dotVariants = {
  bounce: {
    y: [0, -14, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
    <div className="flex items-end gap-2">
      {['bg-primary', 'bg-gold', 'bg-primary'].map((color, i) => (
        <motion.span
          key={i}
          className={`h-3.5 w-3.5 rounded-full ${color}`}
          variants={dotVariants}
          animate="bounce"
          transition={{ delay: i * 0.15 }}
        />
      ))}
    </div>
    <motion.p
      className="dateline text-gray-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      Loading
    </motion.p>
  </div>
)

export default PageLoader
