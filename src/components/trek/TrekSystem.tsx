import { animate, stagger } from 'animejs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActionDock } from './ActionDock'
import { ChecklistSection } from './ChecklistSection'
import { BASE_SECTIONS } from './config'
import { Hud } from './Hud'
import { Manifest } from './Manifest'
import { ProfileBar } from './ProfileBar'
import { Toast } from './Toast'
import { calculateTotals, getSections } from './trek-utils'
import { useTrekState } from './useTrekState'

export default function TrekSystem() {
  const [state, setState] = useTrekState()
  const [manifestOpen, setManifestOpen] = useState(false)
  const [message, setMessage] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const sections = useMemo(() => getSections(state, BASE_SECTIONS), [state.extra])
  const totals = useMemo(() => calculateTotals(sections, state), [sections, state])
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

  const resetChecklist = () => {
    const accepted = confirm(
      'Se desmarcan todos los ítems.\n\nLos descartes, pesos y cantidades se conservan.',
    )
    if (!accepted) return
    setState((current) => ({ ...current, chk: {} }))
    setMessage('Lista desmarcada')
  }

  return (
    <div
      className="trek"
      ref={root}
    >
      <Hud totals={totals} />
      <ProfileBar
        state={state}
        setState={setState}
      />
      <main className="wrap">
        {sections.map((section) => (
          <ChecklistSection
            key={section.id}
            section={section}
            stats={totals.bySection[section.id]}
            state={state}
            setState={setState}
            onMessage={setMessage}
          />
        ))}
        <p className="foot">
          Desliza una fila hacia la derecha para descartarla.
          <br />
          Los pesos son estimaciones. Tócalos y corrígelos con báscula.
        </p>
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
