"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SettingsContextType {
  theme: "light" | "dark" | "high-contrast"
  language: "es" | "en"
  soundEnabled: boolean
  vibrationEnabled: boolean
  showTutorial: boolean
  setTheme: (theme: "light" | "dark" | "high-contrast") => void
  setLanguage: (language: "es" | "en") => void
  setSoundEnabled: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
  setShowTutorial: (show: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("light")
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("kanoodle-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setTheme(settings.theme || "light")
      setLanguage(settings.language || "es")
      setSoundEnabled(settings.soundEnabled ?? true)
      setVibrationEnabled(settings.vibrationEnabled ?? true)
      setShowTutorial(settings.showTutorial ?? true)
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage
    const settings = {
      theme,
      language,
      soundEnabled,
      vibrationEnabled,
      showTutorial,
    }
    localStorage.setItem("kanoodle-settings", JSON.stringify(settings))

    // Apply theme to document
    document.documentElement.className = theme === "dark" ? "dark" : theme === "high-contrast" ? "high-contrast" : ""
  }, [theme, language, soundEnabled, vibrationEnabled, showTutorial])

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        soundEnabled,
        vibrationEnabled,
        showTutorial,
        setTheme,
        setLanguage,
        setSoundEnabled,
        setVibrationEnabled,
        setShowTutorial,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
