import { animate, stagger } from 'animejs'
import { useRef, type Dispatch, type SetStateAction } from 'react'
import type { SectionStats, TrekItem, TrekSection, TrekState } from '../../types/trek'
import { AddItemForm } from './AddItemForm'
import { ChecklistItem } from './ChecklistItem'
import { formatPreciseWeight } from './trek-utils'

type ChecklistSectionProps = {
  section: TrekSection
  stats: SectionStats
  state: TrekState
  setState: Dispatch<SetStateAction<TrekState>>
  onMessage: (message: string) => void
}

export function ChecklistSection({ section, stats, state, setState, onMessage }: ChecklistSectionProps) {
  const body = useRef<HTMLDivElement>(null)
  const open = Boolean(state.open[section.id])
  const custom = section.type === 'custom'

  if (section.prof && !state.prof[section.prof]) return null

  const toggle = () => {
    const nextOpen = !open
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
      className={`sec ${open ? 'open' : ''} ${custom ? 'custom' : ''}`}
      data-profile={section.prof}
    >
      <button
        className="sh"
        type="button"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="sh-t">
          <span className="sh-name">{section.t}</span>
          <span className="sh-meta">
            {stats.done} de {stats.total} listos
            {stats.off ? (
              <span className="dsc">
                {' '}
                · {stats.off} descartado{stats.off > 1 ? 's' : ''}
              </span>
            ) : null}
          </span>
        </span>
        <span className="sh-kg">
          {formatPreciseWeight(stats.kg)} <small>KG</small>
        </span>
        <span className="caret" />
      </button>
      {open ? (
        <div
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
