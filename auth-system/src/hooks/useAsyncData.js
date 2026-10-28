import { useCallback, useEffect, useState } from 'react'

// Runs an async function (usually a service call) and tracks its progress:
//   const { data, loading, error, reload } = useAsyncData(fetchSomething)
//
// IMPORTANT: pass a function with a stable identity: define it outside the
// component, or wrap it in useCallback. A new function on every render would
// make the hook reload forever.
export function useAsyncData(asyncFunction) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false // ignore the result if the component left the screen

    asyncFunction()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [asyncFunction, reloadCount])

  // Lets a "Try again" button run the request again
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null }))
    setReloadCount((count) => count + 1)
  }, [])

  return { ...state, reload }
}