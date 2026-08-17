import CountUp from './CountUp'

export const parseStatValue = (raw) => {
  const str = String(raw ?? '').trim()
  const match = str.match(/^(\D*)([\d,]+(?:\.\d+)?)(\D*)$/)
  if (!match) return { prefix: '', end: 0, suffix: str }
  const [, prefix, numberPart, suffix] = match
  return { prefix, end: parseFloat(numberPart.replace(/,/g, '')) || 0, suffix }
}

const AnimatedStat = ({ value, duration = 2, className = '' }) => {
  const { prefix, end, suffix } = parseStatValue(value)
  return <CountUp end={end} prefix={prefix} suffix={suffix} duration={duration} className={className} />
}

export default AnimatedStat
