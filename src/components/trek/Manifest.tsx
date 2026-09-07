import { animate, stagger } from 'animejs'
import { useEffect, useMemo, useRef } from 'react'
import type { TrekItem, TrekSection, TrekState } from '../../types/trek'
import {
  buildManifestText,
  calculateTotals,
  formatDisplayWeight,
  formatWeight,
  getQuantity,
  getWeight,
} from './trek-utils'

type ManifestProps = {
  sections: TrekSection[]
  state: TrekState
  onClose: () => void
  onMessage: (message: string) => void
}

export function Manifest({ sections, state, onClose, onMessage }: ManifestProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const groups = useMemo(
    () =>
      sections
        .filter((section) => !section.prof || state.prof[section.prof])
        .map((section) => ({
          section,
          items: section.items.filter((item) => state.chk[item.id] && !state.off[item.id]),
        }))
        .filter((group) => group.items.length),
    [sections, state],
  )
  const totals = calculateTotals(sections, state)
  const text = buildManifestText(sections, state)
  const heaviest = useMemo(() => {
    const items: TrekItem[] = []
    for (const group of groups) items.push(...group.items)
    return items
      .filter((item) => getWeight(item, state) > 0)
      .toSorted((first, second) => getWeight(second, state) - getWeight(first, state))
      .slice(0, 5)
  }, [groups, state])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog.current) return
      const focusable = dialog.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleDialogKey)
    requestAnimationFrame(() => {
      dialog.current?.querySelector<HTMLButtonElement>('.x')?.focus()
      if (dialog.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animate(dialog.current.querySelectorAll('.mgrp, .heavy, .mo-sum'), {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 340,
          delay: stagger(35),
          ease: 'outQuad',
        })
      }
    })
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleDialogKey)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      onMessage('Copiado al portapapeles')
    } catch {
      onMessage('No se pudo copiar')
    }
  }

  const share = async () => {
    if (!navigator.share) {
      await copy()
      return
    }
    try {
      await navigator.share({ title: 'Empacados — TREK//SYS', text })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await copy()
    }
  }

  return (
    <div
      className="ov on"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manifest-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="mo"
        ref={dialog}
      >
        <div className="mo-h">
          <div>
            <span className="mo-code">TRK//MANIFEST-01</span>
            <h2 id="manifest-title">EQUIPO EMPACADO</h2>
          </div>
          <button
            className="x"
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {!groups.length ? (
          <div className="empty">
            <b>NADA EMPACADO</b>
            Empaca los ítems que vas a llevar
            <br />y su peso aparecerá aquí.
          </div>
        ) : (
          <>
            <div className="mo-sum">
              <div className="kg">{formatWeight(totals.kg)}</div>
              <div className="kg-u">KG</div>
              <div className="side">
                <div>
                  <b>{totals.done}</b> empacados
                </div>
                <div>{state.prof.frio ? 'FRÍO' : 'salida base'}</div>
              </div>
            </div>
            {groups.map(({ section, items }) => {
              const sectionWeight = items.reduce((sum, item) => sum + getWeight(item, state), 0)
              return (
                <div
                  className="mgrp"
                  key={section.id}
                >
                  <h3>
                    <span>{section.t.toUpperCase()}</span>
                    <span className="ln" />
                    <span className="g">{formatDisplayWeight(sectionWeight)}</span>
                  </h3>
                  {items.map((item) => (
                    <div
                      className="mi"
                      key={item.id}
                    >
                      <span>▸</span>
                      <span>
                        {item.n}
                        {item.q ? (
                          <em>
                            {' '}
                            — {getQuantity(item, state)} {item.q.u}
                          </em>
                        ) : null}
                      </span>
                      <span className="mw">{formatDisplayWeight(getWeight(item, state))}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {heaviest.length ? (
              <div className="heavy">
                <h4>DÓNDE ESTÁ EL PESO</h4>
                {heaviest.map((item) => (
                  <div
                    className="hb"
                    key={item.id}
                  >
                    <span className="hn">{item.n}</span>
                    <span className="hbar">
                      <i
                        style={{
                          width: `${(getWeight(item, state) / getWeight(heaviest[0], state)) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="hkg">{formatDisplayWeight(getWeight(item, state))}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mo-act">
              <button
                className="btn"
                type="button"
                onClick={share}
              >
                COMPARTIR
              </button>
              <button
                className="btn btn-copy"
                type="button"
                onClick={copy}
              >
                COPIAR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
