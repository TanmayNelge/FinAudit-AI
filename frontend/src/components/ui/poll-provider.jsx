import { useEffect, useState } from 'react'
import { PollContext } from '@/components/ui/use-polling.js'

// Mounted once when a user is logged in. Advances a shared tick every 5s so
// StatCards, DocumentsTable and NotificationBell refetch on a single timer
// instead of three independent intervals.
export function PollProvider({ children }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  return <PollContext.Provider value={tick}>{children}</PollContext.Provider>
}