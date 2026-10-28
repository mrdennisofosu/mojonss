import { getPasswordChecks } from './passwordStrength'

// Each validator returns an error message, or '' when the value is valid.
// They are plain functions with no React in them, so every form can share them.

export function validateFullName(value) {
  const name = value.trim()
  if (!name) return 'Enter your full name.'
  if (name.split(/\s+/).length < 2) return 'Enter your first and last name.'
  if (name.length > 60) return 'Your name must be 60 characters or fewer.'
  if (!/^[\p{L}\p{M}][\p{L}\p{M}'. -]*$/u.test(name)) {
    return 'Use letters, spaces, hyphens, apostrophes and periods only.'
  }
  return ''
}

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Enter your email address.'
  if (email.length > 254) return 'That email address is too long.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Enter a password.'

  const missing = getPasswordChecks(value)
    .filter((check) => check.required && !check.passed)
    .map((check) => check.label.toLowerCase())

  if (missing.length > 0) return `Your password needs: ${missing.join(', ')}.`
  return ''
}

export function validateConfirmPassword(confirmValue, password) {
  if (!confirmValue) return 'Confirm your password.'
  if (confirmValue !== password) return 'The passwords do not match.'
  return ''
}

export function validateTerms(accepted) {
  return accepted ? '' : 'You must accept the terms and conditions to continue.'
}

// Takes { field: message } and keeps only the fields that have a message.
export function compactErrors(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message))
}