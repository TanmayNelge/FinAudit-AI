import { createContext, useContext } from 'react'

// Single polling clock shared by every data component (stat cards, document
// table, notification bell). One 5s interval advances the tick; consumers
// refetch whenever it changes. Kept separate from the provider component so
// the react-refresh rule (only-export-components) stays clean.
export const PollContext = createContext(0)

export function usePollTick() {
  return useContext(PollContext)
}