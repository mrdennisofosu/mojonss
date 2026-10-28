import { useContext } from 'react'
import { SettingsContext } from '../context/SettingsContext'

// const { loaded, registrationEnabled, refreshSettings } = useSettings()
export function useSettings() {
  const context = useContext(SettingsContext)

  if (context === null) {
    throw new Error('useSettings must be used inside <SettingsProvider>')
  }

  return context
}