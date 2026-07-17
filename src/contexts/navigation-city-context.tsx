import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

export interface NavigationCity {
  city: string
  state: string
  label: string
}

interface NavigationCityContextValue {
  navigationCity: NavigationCity | null
  setNavigationCity: (city: NavigationCity) => void
  clearNavigationCity: () => void
}

const NavigationCityContext = createContext<NavigationCityContextValue | null>(null)

const LEGACY_KEY = "@gabinete:navigation_city"

function cityStorageKey(userId: string) {
  return `@gabinete:navigation_city:${userId}`
}

function readStored(key: string): NavigationCity | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as NavigationCity) : null
  } catch {
    return null
  }
}

export function NavigationCityProvider({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth()
  const userId = user?.id ?? "guest"
  const prevUserIdRef = useRef<string | null>(null)

  const [navigationCity, setNavigationCityState] = useState<NavigationCity | null>(null)

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY)
  }, [])

  useEffect(() => {
    if (isInitializing) return
    if (prevUserIdRef.current === userId) return
    prevUserIdRef.current = userId
    setNavigationCityState(readStored(cityStorageKey(userId)))
  }, [userId, isInitializing])

  useEffect(() => {
    if (isInitializing) return
    const params = new URLSearchParams(window.location.search)
    const urlCity = params.get("city")
    const urlState = params.get("state")
    if (urlCity && urlState) {
      const city: NavigationCity = { city: urlCity, state: urlState, label: `${urlCity}, ${urlState}` }
      localStorage.setItem(cityStorageKey(userId), JSON.stringify(city))
      setNavigationCityState(city)
    }
  }, [isInitializing, userId])

  const setNavigationCity = useCallback((city: NavigationCity) => {
    localStorage.setItem(cityStorageKey(userId), JSON.stringify(city))
    setNavigationCityState(city)
  }, [userId])

  const clearNavigationCity = useCallback(() => {
    localStorage.removeItem(cityStorageKey(userId))
    setNavigationCityState(null)
  }, [userId])

  return (
    <NavigationCityContext.Provider value={{ navigationCity, setNavigationCity, clearNavigationCity }}>
      {children}
    </NavigationCityContext.Provider>
  )
}

export function useNavigationCity() {
  const ctx = useContext(NavigationCityContext)
  if (!ctx) throw new Error("useNavigationCity must be used inside NavigationCityProvider")
  return ctx
}
