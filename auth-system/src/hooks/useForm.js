import { useState } from 'react'

// A small hook that handles the repetitive parts of every form:
//   values:       what the user has typed
//   touched:      which fields the user has already visited
//   errors:       calculated from the values by your validate function
//   getError(x):  the error to SHOW for a field. Only after it was touched,
//                 so people aren't told they made mistakes before they start.
//
// validate(values) must return an object like { email: 'Enter a valid email.' }
// containing only the fields that have an error.
export function useForm({ initialValues, validate }) {
    const [values, setValues] = useState(initialValues)
    const [touched, setTouched] = useState({})

    // Errors are calculated every render from the current values (no extra state).
    const errors = validate(values)

    function handleChange(event) {
        const { name, type, checked, value } = event.target
        setValues((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    function handleBlur(event) {
        const { name } = event.target
        setTouched((previous) => ({ ...previous, [name]: true }))
    }

    function getError(name) {
        return touched[name] ? errors[name] : undefined
    }

    // Call on submit. Marks every field as touched so ALL errors show,
    // and returns true only if the form is valid.
    function validateAll() {
        const allTouched = {}
        Object.keys(initialValues).forEach((name) => {
            allTouched[name] = true
        })
        setTouched(allTouched)
        return Object.keys(errors).length === 0
    }

    function reset() {
        setValues(initialValues)
        setTouched({})
    }

    return { values, setValues, errors, getError, handleChange, handleBlur, validateAll, reset }
}