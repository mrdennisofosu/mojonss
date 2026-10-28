import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

// const { showToast } = useToast()
export function useToast() {
  const context = useContext(ToastContext)

  if (context === null) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }

  return context
}