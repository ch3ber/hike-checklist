import { animate, stagger } from 'animejs'
import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { SectionStats, TrekItem, TrekSection, TrekState } from '../../types/trek'
import { AddItemForm } from './AddItemForm'
import { ChecklistItem } from './ChecklistItem'
import { getDisplayWeight } from './trek-utils'

type ChecklistSectionProps = {
  index: number
  section: TrekSection
  stats: SectionStats
  state: TrekState
  setState: Dispatch<SetStateAction<TrekState>>
  onMessage: (message: string) => void
  forceOpen?: boolean
}

export function ChecklistSection({
  index,
  section,
  stats,
  state,
  setState,
  onMessage,
  forceOpen = false,
}: ChecklistSectionProps) {
  const body = useRef<HTMLDivElement>(null)
  const open = Boolean(state.open[section.id])
  const expanded = forceOpen || open
  const [bodyMounted, setBodyMounted] = useState(expanded)
  const [bodyVisible, setBodyVisible] = useState(expanded)
  const firstRender = useRef(true)
  const revealPending = useRef(false)
  const revealFrame = useRef<number>(undefined)
  const collapseTimer = useRef<number>(undefined)
  const unmountTimer = useRef<number>(undefined)
  const itemAnimation = useRef<{ cancel: () => void } | null>(null)
  const entryAnimations = useRef<Animation[]>([])
  const custom = section.type === 'custom'
  const displayWeight = getDisplayWeight(stats.kg)
  const panelId = `section-${section.id}`

  useEffect(() => {
    const cancelScheduledWork = () => {
      window.cancelAnimationFrame(revealFrame.current)
      window.clearTimeout(collapseTimer.current)
      window.clearTimeout(unmountTimer.current)
      itemAnimation.current?.cancel()
      entryAnimations.current.forEach((animation) => animation.cancel())
      entryAnimations.current = []
    }
    cancelScheduledWork()

    if (firstRender.current) {
      firstRender.current = false
      return cancelScheduledWork
    }

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (expanded) {
      revealPending.current = true
      setBodyMounted(true)
      if (reducedMotion) {
        revealPending.current = false
        setBodyVisible(true)
        return cancelScheduledWork
      }
      return cancelScheduledWork
    }

    if (reducedMotion) {
      setBodyVisible(false)
      setBodyMounted(false)
      return cancelScheduledWork
    }

    const entries = body.current?.querySelectorAll(
      ':scope > .row, :scope > .mt, :scope > .addf, :scope > .collapse-section',
    )
    if (entries?.length) {
      itemAnimation.current = animate(entries, {
        opacity: 0,
        translateX: 16,
        duration: 130,
        delay: stagger(10, { from: 'last' }),
        ease: 'inQuad',
      })
    }
    const closeDelay = Math.min(520, 130 + (entries?.length ?? 0) * 10)
    collapseTimer.current = window.setTimeout(() => {
      setBodyVisible(false)
      unmountTimer.current = window.setTimeout(() => setBodyMounted(false), 430)
    }, closeDelay)

    return cancelScheduledWork
  }, [expanded])

  useLayoutEffect(() => {
    if (!expanded || !bodyMounted || !revealPending.current || !body.current) return
    revealPending.current = false

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBodyVisible(true)
      return
    }

    const entries = body.current.querySelectorAll(
      ':scope > .row, :scope > .mt, :scope > .addf, :scope > .collapse-section',
    )
    entryAnimations.current = [...entries].map((entry, entryIndex) =>
      entry.animate(
        [
          {
            opacity: 0,
            transform: 'translate3d(-18px, 0, 0) skewX(-7deg)',
            clipPath: 'inset(0 100% 0 0)',
          },
          {
            opacity: 0.7,
            transform: 'translate3d(3px, 0, 0) skewX(3deg)',
            clipPath: 'inset(0 0 0 0)',
            offset: 0.58,
          },
          {
            opacity: 1,
            transform: 'translate3d(0, 0, 0) skewX(0)',
            clipPath: 'inset(0 0 0 0)',
          },
        ],
        {
          duration: 180,
          delay: 460 + entryIndex * 110,
          easing: 'steps(4, end)',
          fill: 'both',
        },
      ),
    )
    revealFrame.current = requestAnimationFrame(() => setBodyVisible(true))

    return () => {
      window.cancelAnimationFrame(revealFrame.current)
      entryAnimations.current.forEach((animation) => animation.cancel())
      entryAnimations.current = []
    }
  }, [bodyMounted, expanded])

  if (section.prof && !state.prof[section.prof]) return null

  const toggle = () => {
    const nextOpen = !expanded
    setState((current) => ({
      ...current,
      open: { ...current.open, [section.id]: nextOpen },
    }))
  }

  const addItem = (item: TrekItem) => {
    setState((current) => ({
      ...current,
      extra: [...current.extra, item],
    }))
    onMessage('Agregado a Extras')
  }

  return (
    <section
      className={`sec ${expanded ? 'open' : ''} ${custom ? 'custom' : ''}`}
      data-profile={section.prof}
    >
      <button
        className="sh"
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        disabled={forceOpen}
        onClick={toggle}
      >
        <span
          className="sh-code"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="sh-t">
          <span className="sh-name">{section.t}</span>
          <span className="sh-meta">
            {stats.done} de {stats.total} empacados
            {stats.off ? (
              <span className="dsc">
                {' '}
                · {stats.off} descartado{stats.off > 1 ? 's' : ''}
              </span>
            ) : null}
          </span>
        </span>
        <span className="sh-kg">
          {displayWeight.value} <small>{displayWeight.unit}</small>
        </span>
        <span
          className="caret"
          aria-hidden="true"
        />
      </button>
      {bodyMounted ? (
        <div
          className={`sb-shell ${bodyVisible ? 'is-visible' : ''}`}
          aria-hidden={!expanded}
          inert={expanded ? undefined : true}
        >
          <div className="sb-clip">
            <div
              id={panelId}
              className="sb"
              ref={body}
            >
              {custom && !section.items.length ? (
                <div className="mt">Vacío. Agrega lo que lleves fuera de la lista base.</div>
              ) : null}
              {section.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  custom={custom}
                  state={state}
                  setState={setState}
                />
              ))}
              {custom ? (
                <AddItemForm
                  onAdd={addItem}
                  onMessage={onMessage}
                />
              ) : null}
              <button
                className="collapse-section"
                type="button"
                disabled={forceOpen}
                aria-label={`Colapsar ${section.t}`}
                onClick={toggle}
              >
                <span aria-hidden="true">⌃</span>
                <span>{forceOpen ? 'FILTRO ACTIVO' : 'COLAPSAR SECCIÓN'}</span>
                <small>SEC//{String(index + 1).padStart(2, '0')}</small>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
