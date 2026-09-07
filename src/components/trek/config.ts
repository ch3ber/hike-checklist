import data from '@DB/data.json'
import type { TrekSection, TrekState } from '../../types/trek'

export const STORAGE_KEY = 'treksys_v2'
export const PROFILES = [{ id: 'frio', name: 'FRÍO' }] as const
export const BASE_SECTIONS = data as TrekSection[]

export const EMPTY_STATE: TrekState = {
  chk: {},
  qty: {},
  wov: {},
  off: {},
  prof: {},
  open: { personales: true },
  extra: [],
}
