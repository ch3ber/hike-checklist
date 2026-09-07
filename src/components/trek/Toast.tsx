import { animate } from 'animejs'
import { useEffect, useRef } from 'react'

type ToastProps = {
  message: string
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message || !element.current) return
    const node = element.current
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const enter = reducedMotion
      ? null
      : animate(node, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 220,
          ease: 'outQuad',
        })
    if (reducedMotion) node.style.opacity = '1'
    const timeout = window.setTimeout(() => {
      if (reducedMotion) {
        node.style.opacity = '0'
        onDone()
      } else {
        animate(node, {
          opacity: 0,
          duration: 280,
          onComplete: onDone,
        })
      }
    }, 2100)
    return () => {
      enter?.cancel()
      window.clearTimeout(timeout)
    }
  }, [message, onDone])

  return (
    <div
      className="toast"
      ref={element}
      role="status"
    >
      {message}
    </div>
  )
}
