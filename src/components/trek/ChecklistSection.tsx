import { animate, stagger } from 'animejs'
import { useRef, type Dispatch, type SetStateAction } from 'react'
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
  const custom = section.type === 'custom'
  const displayWeight = getDisplayWeight(stats.kg)
  const panelId = `section-${section.id}`

  if (section.prof && !state.prof[section.prof]) return null

  const toggle = () => {
    const nextOpen = !expanded
    setState((current) => ({
      ...current,
      open: { ...current.open, [section.id]: nextOpen },
    }))
    if (!nextOpen || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    requestAnimationFrame(() => {
      if (!body.current) return
      animate(body.current.querySelectorAll('.row'), {
        opacity: [0, 1],
        translateX: [-14, 0],
        duration: 300,
        delay: stagger(20),
        ease: 'outQuad',
      })
    })
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
      {expanded ? (
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
        </div>
      ) : null}
    </section>
  )
}
