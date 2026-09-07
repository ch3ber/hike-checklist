import { animate } from 'animejs'
import { useEffect, useRef } from 'react'
import type { TrekTotals } from '../../types/trek'
import { formatWeight } from './trek-utils'

type HudProps = {
  totals: TrekTotals
  saveStatus: 'loading' | 'saving' | 'saved'
}

export function Hud({ totals, saveStatus }: HudProps) {
  const weight = useRef<HTMLDivElement>(null)
  const animatedWeight = useRef(0)
  const percentage = totals.total ? Math.round((totals.done / totals.total) * 100) : 0
  const date = new Date()
    .toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    .toUpperCase()
    .replace('.', '')

  useEffect(() => {
    if (!weight.current) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedWeight.current = totals.kg
      weight.current.textContent = formatWeight(totals.kg)
      return
    }

    const counter = { value: animatedWeight.current }
    const animation = animate(counter, {
      value: totals.kg,
      duration: 520,
      ease: 'outExpo',
      onUpdate: () => {
        animatedWeight.current = counter.value
        if (weight.current) {
          weight.current.textContent = formatWeight(counter.value)
        }
      },
    })
    return () => animation.cancel()
  }, [totals.kg])

  return (
    <header className="hud">
      <div className="hud-in">
        <div className="hud-top">
          <span className="dot" />
          <span>TREK//SYS</span>
          <span className="sep" />
          <span className={`save-state ${saveStatus}`}>
            {saveStatus === 'saving' ? 'GUARDANDO' : saveStatus === 'saved' ? 'GUARDADO' : 'CARGANDO'}
          </span>
          <span>{date}</span>
        </div>
        <div className="hud-mid">
          <div
            className="kg"
            ref={weight}
          >
            0.00
          </div>
          <div className="kg-u">KG</div>
          <div className="hud-stats">
            <div>
              <b>{totals.done}</b> ítems empacados
            </div>
            <div>
              <b>{percentage}%</b> ·{' '}
              <span className="off">
                {totals.off} descartado{totals.off === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-label="Progreso de empacado"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <i style={{ width: `${percentage}%` }} />
        </div>
        {totals.ghost ? (
          <div className="warn on">
            ⚠ {totals.ghost} ítem{totals.ghost > 1 ? 's empacados' : ' empacado'} en Frío, que está apagado.
            No cuenta
            {totals.ghost > 1 ? 'n' : ''} en el peso.
          </div>
        ) : (
          <div className="warn" />
        )}
      </div>
    </header>
  )
}
