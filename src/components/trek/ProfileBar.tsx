import { animate } from 'animejs'
import type { Dispatch, SetStateAction } from 'react'
import type { TrekState } from '../../types/trek'
import { PROFILES } from './config'

type ProfileBarProps = {
  state: TrekState
  setState: Dispatch<SetStateAction<TrekState>>
}

export function ProfileBar({ state, setState }: ProfileBarProps) {
  const toggleProfile = (profileId: string) => {
    const enabled = !state.prof[profileId]
    setState((current) => ({
      ...current,
      prof: { ...current.prof, [profileId]: enabled },
    }))

    if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    requestAnimationFrame(() => {
      const section = document.querySelector(`[data-profile="${profileId}"]`)
      if (section) {
        animate(section, {
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: 340,
          ease: 'outQuad',
        })
      }
    })
  }

  return (
    <div className="prof">
      <span className="prof-code">
        <small>MOD//CLIMA</small>
        <b>01</b>
      </span>
      {PROFILES.map((profile) => (
        <button
          key={profile.id}
          className={`chip ${state.prof[profile.id] ? 'on' : ''}`}
          type="button"
          aria-pressed={Boolean(state.prof[profile.id])}
          onClick={() => toggleProfile(profile.id)}
        >
          {profile.name}
        </button>
      ))}
      <span className="hint">equipo específico para frío</span>
    </div>
  )
}
