import { useEffect, useRef } from 'react'

// useOnEvent(SUPPORT_CHANGED, reload): runs reload whenever that message is sent.
export function useOnEvent(name, callback) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    const handler = () => saved.current()
    window.addEventListener(name, handler)
    return () => window.removeEventListener(name, handler)
  }, [name])
}