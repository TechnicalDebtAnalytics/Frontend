import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  isTheme,
  preferredTheme,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
} from './theme'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const activeTheme = document.documentElement.dataset.theme ?? null
    return isTheme(activeTheme) ? activeTheme : preferredTheme()
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // The visual preference still works for the current session.
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
