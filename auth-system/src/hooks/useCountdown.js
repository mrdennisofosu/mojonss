import { useCallback, useEffect, useState } from 'react'

// A simple countdown, used to temporarily disable the "Resend" button.
//   const { secondsLeft, start } = useCountdown()
//   start(30)  ->  secondsLeft goes 30, 29, 28 ... 0
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000)
    return () => clearTimeout(timer) // clean up if the page is left
  }, [secondsLeft])

  const start = useCallback((seconds) => setSecondsLeft(seconds), [])

  return { secondsLeft, start }
}