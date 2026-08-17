import { motion } from 'framer-motion'

const VARIANTS = {
  float: { animate: { y: [0, -8, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  pulse: { animate: { scale: [1, 1.15, 1] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } },
  spin: { animate: { rotate: 360 }, transition: { duration: 6, repeat: Infinity, ease: 'linear' } },
  wiggle: { animate: { rotate: [0, -10, 10, -6, 0] }, transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } },
}

const AnimatedIcon = ({ icon: Icon, size = 48, className = '', haloClassName = 'bg-current', variant = 'float' }) => {
  const v = VARIANTS[variant] || VARIANTS.float

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size * 1.8, height: size * 1.8 }}>
      <motion.span
        className={`absolute inset-0 rounded-full opacity-20 ${haloClassName}`}
        animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.25, 0, 0.25] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div animate={v.animate} transition={v.transition} className="relative">
        <Icon className={className} size={size} />
      </motion.div>
    </div>
  )
}

export default AnimatedIcon
