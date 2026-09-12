import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeContext } from './use-theme.js'

const STORAGE_KEY = 'finaudit-theme'

function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialTheme())
  const userChosenRef = useRef(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    if (userChosenRef.current) {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  // Follow the OS preference only until the user makes an explicit choice.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (event) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? 'light' : 'dark')
      }
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = useCallback(() => {
    userChosenRef.current = true
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}