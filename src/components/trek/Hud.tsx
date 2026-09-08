import { animate } from 'animejs'
import { useEffect, useRef } from 'react'
import type { TrekTotals } from '../../types/trek'
import { ScrambledNumber } from './ScrambledNumber'
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
        <div className="hud-brandline">
          <div className="brand-lockup">
            <span
              className="brand-mark"
              aria-hidden="true"
            />
            <div>
              <strong className="brand-name">TREK//SYS</strong>
              <span className="brand-sub">CHECKLIST DE CAMPO · MX</span>
            </div>
          </div>
          <div className="hud-node">
            <span>NODO</span>
            <strong>01</strong>
          </div>
        </div>
        <div className="hud-top">
          <span className="dot" />
          <span>CANAL LOCAL</span>
          <span className="sep" />
          <span className={`save-state ${saveStatus}`}>
            {saveStatus === 'saving' ? 'GUARDANDO' : saveStatus === 'saved' ? 'GUARDADO' : 'CARGANDO'}
          </span>
          <span className="hud-date">{date}</span>
        </div>
        <div className="hud-mid">
          <div className="load-readout">
            <span className="readout-label">PESO // EMPACADOS</span>
            <div className="readout-value">
              <div
                className="kg"
                ref={weight}
              >
                0.00
              </div>
              <div className="kg-u">KG</div>
            </div>
          </div>
          <div className="hud-stats">
            <div>
              <span>EMPACADOS</span>
              <b>
                <ScrambledNumber value={totals.done} />
              </b>
            </div>
            <div>
              <span>PROGRESO</span>
              <b>
                <ScrambledNumber
                  value={percentage}
                  suffix="%"
                />
              </b>
            </div>
            <div className="hud-discarded">
              <span>DESCARTADOS</span>
              <b>
                <ScrambledNumber value={totals.off} />
              </b>
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
          <span aria-hidden="true" />
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
