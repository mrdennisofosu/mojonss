import { useEffect, useState } from 'react'

// Returns the value only after it has stopped changing for `delay` ms.
// Used so searching doesn't run on every single keystroke.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}