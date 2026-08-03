import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  forcedTheme?: "light" | "dark"
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  forcedTheme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    return storedTheme || defaultTheme
  })
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const applyTheme = () => {
      if (forcedTheme) {
        root.classList.remove("light", "dark")
        root.classList.add(forcedTheme)
        setResolvedTheme(forcedTheme)
        return
      }
      
      const nextTheme = theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme
      root.classList.remove("light", "dark")
      root.classList.add(nextTheme)
      setResolvedTheme(nextTheme)
    }

    applyTheme()
    if (theme === "system" && !forcedTheme) mediaQuery.addEventListener("change", applyTheme)
    return () => {
      if (!forcedTheme) mediaQuery.removeEventListener("change", applyTheme)
    }
  }, [theme, forcedTheme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
