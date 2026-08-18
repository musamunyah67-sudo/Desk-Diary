import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NavigationProgressBar = () => {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(25)
    const t1 = setTimeout(() => setProgress(65), 120)
    const t2 = setTimeout(() => setProgress(90), 350)
    const t3 = setTimeout(() => setProgress(100), 550)
    const t4 = setTimeout(() => { setVisible(false); setProgress(0) }, 750)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [location.pathname])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="h-full bg-gradient-to-r from-gold via-primary to-gold bg-[length:200%_100%]"
            initial={{ width: '0%', opacity: 1 }}
            animate={{
              width: `${progress}%`,
              opacity: 1,
              backgroundPosition: ['0% 0%', '100% 0%'],
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ width: { duration: 0.25, ease: 'easeOut' }, backgroundPosition: { duration: 1, repeat: Infinity, ease: 'linear' } }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default NavigationProgressBar
