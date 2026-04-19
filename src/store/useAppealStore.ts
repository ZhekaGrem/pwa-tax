'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Comp, Property, Assessment } from '@/schemas/appeal'

type State = {
  id: string | null
  step: 0 | 1 | 2 | 3
  property: Partial<Property>
  assessment: Partial<Assessment>
  selectedComps: Comp[]
  zip: string
}
type Actions = {
  setId: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  setStep: (step: State['step']) => void
  patchProperty: (p: Partial<Property>) => void
  patchAssessment: (a: Partial<Assessment>) => void
  setZip: (zip: string) => void
  toggleComp: (c: Comp) => void
  setComps: (comps: Comp[]) => void
  reset: () => void
}

const initial: State = {
  id: null,
  step: 0,
  property: { county: 'Harris' },
  assessment: { taxRate: 0.0231 },
  selectedComps: [],
  zip: '',
}

export const useAppealStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      setId: (id) => set({ id }),
      nextStep: () => set({ step: Math.min(3, get().step + 1) as State['step'] }),
      prevStep: () => set({ step: Math.max(0, get().step - 1) as State['step'] }),
      setStep: (step) => set({ step }),
      patchProperty: (p) => set({ property: { ...get().property, ...p } }),
      patchAssessment: (a) => set({ assessment: { ...get().assessment, ...a } }),
      setZip: (zip) => set({ zip }),
      toggleComp: (c) => {
        const exists = get().selectedComps.find((x) => x.parcelId === c.parcelId)
        set({
          selectedComps: exists
            ? get().selectedComps.filter((x) => x.parcelId !== c.parcelId)
            : [...get().selectedComps, c],
        })
      },
      setComps: (selectedComps) => set({ selectedComps }),
      reset: () => set(initial),
    }),
    { name: 'appeal-draft' },
  ),
)
