import { useEffect, useState } from 'react'

type ScrambledNumberProps = {
  value: number
  pad?: number
  suffix?: string
}

const formatNumber = (value: number, pad: number, suffix: string) =>
  `${String(Math.trunc(value)).padStart(pad, '0')}${suffix}`

export function ScrambledNumber({ value, pad = 2, suffix = '' }: ScrambledNumberProps) {
  const [scrambledValue, setScrambledValue] = useState<number | null>(null)
  const displayValue = scrambledValue ?? value

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rollTimer: number | undefined
    let finishTimer: number | undefined
    const ceiling = 10 ** Math.min(pad, 3)

    const scramble = () => {
      window.clearInterval(rollTimer)
      window.clearTimeout(finishTimer)
      setScrambledValue(Math.floor(Math.random() * ceiling))
      rollTimer = window.setInterval(() => {
        setScrambledValue(Math.floor(Math.random() * ceiling))
      }, 58)
      finishTimer = window.setTimeout(() => {
        window.clearInterval(rollTimer)
        setScrambledValue(null)
      }, 760)
    }

    const cycleTimer = window.setInterval(scramble, 30_000)
    return () => {
      window.clearInterval(cycleTimer)
      window.clearInterval(rollTimer)
      window.clearTimeout(finishTimer)
    }
  }, [pad])

  return (
    <>
      <span
        className={`scramble-number ${scrambledValue === null ? '' : 'is-scrambling'}`}
        aria-hidden="true"
      >
        {formatNumber(displayValue, pad, suffix)}
      </span>
      <span className="sr-only">{formatNumber(value, pad, suffix)}</span>
    </>
  )
}
