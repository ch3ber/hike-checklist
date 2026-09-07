import { animate, stagger } from 'animejs'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ActionDock } from './ActionDock'
import { ChecklistSection } from './ChecklistSection'
import { ChecklistToolbar, type ChecklistFilter } from './ChecklistToolbar'
import { BASE_SECTIONS } from './config'
import { Hud } from './Hud'
import { Manifest } from './Manifest'
import { ProfileBar } from './ProfileBar'
import { Toast } from './Toast'
import { calculateTotals, getSections } from './trek-utils'
import { useTrekState } from './useTrekState'

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')

export default function TrekSystem() {
  const [state, setState, saveStatus] = useTrekState()
  const [manifestOpen, setManifestOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ChecklistFilter>('all')
  const root = useRef<HTMLDivElement>(null)
  const filterAnimationReady = useRef(false)
  const sections = useMemo(() => getSections(state, BASE_SECTIONS), [state.extra])
  const totals = useMemo(() => calculateTotals(sections, state), [sections, state])
  const normalizedQuery = normalizeSearch(query.trim())
  const filtering = Boolean(normalizedQuery) || filter !== 'all'
  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => !section.prof || state.prof[section.prof])
        .map((section) => {
          const sectionMatches = normalizeSearch(section.t).includes(normalizedQuery)
          const items = section.items.filter((item) => {
            const matchesQuery =
              !normalizedQuery ||
              sectionMatches ||
              normalizeSearch(`${item.n} ${item.note ?? ''}`).includes(normalizedQuery)
            if (!matchesQuery) return false
            if (filter === 'packed') return Boolean(state.chk[item.id]) && !state.off[item.id]
            if (filter === 'discarded') return Boolean(state.off[item.id])
            if (filter === 'pending') return !state.chk[item.id] && !state.off[item.id]
            return true
          })
          return { ...section, items }
        })
        .filter((section) => !filtering || section.items.length > 0),
    [filter, filtering, normalizedQuery, sections, state.chk, state.off, state.prof],
  )
  const visibleItemCount = visibleSections.reduce((sum, section) => sum + section.items.length, 0)
  const nextSection = sections.find((section) => {
    if (section.prof && !state.prof[section.prof]) return false
    const stats = totals.bySection[section.id]
    return stats && stats.done < stats.total
  })
  const clearMessage = useCallback(() => setMessage(''), [])
  const closeManifest = useCallback(() => setManifestOpen(false), [])

  useEffect(() => {
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const hudAnimation = animate(root.current.querySelectorAll('.hud-in > *'), {
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 480,
      delay: stagger(55),
      ease: 'outQuad',
    })
    const sectionAnimation = animate(root.current.querySelectorAll('.sec'), {
      opacity: [0, 1],
      translateX: [-10, 0],
      duration: 400,
      delay: stagger(30, { start: 220 }),
      ease: 'outQuad',
    })
    return () => {
      hudAnimation.cancel()
      sectionAnimation.cancel()
    }
  }, [])

  useEffect(() => {
    if (!filterAnimationReady.current) {
      filterAnimationReady.current = true
      return
    }
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animation = animate(root.current.querySelectorAll('.sec'), {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 260,
      delay: stagger(18),
      ease: 'outQuad',
    })
    return () => animation.cancel()
  }, [filter, normalizedQuery])

  const resetChecklist = () => {
    const accepted = confirm(
      'Se quitarán todos los elementos empacados.\n\nLos descartes, pesos y cantidades se conservan.',
    )
    if (!accepted) return
    setState((current) => ({ ...current, chk: {} }))
    setMessage('Lista de empacados reiniciada')
  }

  return (
    <div
      className="trek"
      ref={root}
    >
      <a
        className="skip-link"
        href="#checklist"
      >
        Ir al checklist
      </a>
      <Hud
        totals={totals}
        saveStatus={saveStatus}
      />
      <ProfileBar
        state={state}
        setState={setState}
      />
      <main
        className="wrap"
        id="checklist"
        tabIndex={-1}
      >
        <div className="checklist-shell">
          <div className="checklist-main">
            <ChecklistToolbar
              query={query}
              filter={filter}
              resultCount={visibleItemCount}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
            />
            <div className="section-list">
              {visibleSections.map((section, sectionIndex) => (
                <ChecklistSection
                  key={section.id}
                  index={sectionIndex}
                  section={section}
                  stats={totals.bySection[section.id]}
                  state={state}
                  setState={setState}
                  onMessage={setMessage}
                  forceOpen={filtering}
                />
              ))}
              {!visibleSections.length ? (
                <div className="no-results">
                  <span aria-hidden="true">⌁</span>
                  No hay equipo que coincida con este filtro.
                </div>
              ) : null}
            </div>
            <p className="foot">
              Los pesos son estimaciones. Tócalos para corregirlos con báscula.
              <br />
              Hasta 999 g se muestran gramos; desde 1 kg, kilogramos.
            </p>
          </div>
          <aside
            className="desk-panel"
            aria-label="Estado de preparación"
          >
            <span className="desk-kicker">ESTADO DE PREPARACIÓN</span>
            <div
              className="progress-orbit"
              style={
                {
                  '--progress': `${totals.total ? (totals.done / totals.total) * 360 : 0}deg`,
                } as CSSProperties
              }
            >
              <strong>{totals.total ? Math.round((totals.done / totals.total) * 100) : 0}%</strong>
              <span>empacado</span>
            </div>
            <dl className="desk-stats">
              <div>
                <dt>Empacados</dt>
                <dd>{totals.done}</dd>
              </div>
              <div>
                <dt>Pendientes</dt>
                <dd>{Math.max(0, totals.total - totals.done)}</dd>
              </div>
              <div>
                <dt>Descartados</dt>
                <dd>{totals.off}</dd>
              </div>
            </dl>
            <div className="next-target">
              <span>SIGUIENTE OBJETIVO</span>
              <strong>{nextSection?.t ?? 'Checklist completo'}</strong>
            </div>
            <p>Los cambios se guardan automáticamente en este dispositivo.</p>
          </aside>
        </div>
      </main>
      <ActionDock
        onOpenManifest={() => setManifestOpen(true)}
        onReset={resetChecklist}
      />
      {manifestOpen ? (
        <Manifest
          sections={sections}
          state={state}
          onClose={closeManifest}
          onMessage={setMessage}
        />
      ) : null}
      {message ? (
        <Toast
          message={message}
          onDone={clearMessage}
        />
      ) : null}
    </div>
  )
}
