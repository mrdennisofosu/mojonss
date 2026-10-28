// Password rules and strength, in one place. Registration, reset password and
// change password all use this file, so the rules can never disagree.
//
// NOTE: this is a convenience for the user. The real rules must also be
// enforced by the backend later; the browser can always be bypassed.

export const PASSWORD_MIN_LENGTH = 8

// Each check says whether the password passes it, and whether it is required.
export function getPasswordChecks(password) {
  return [
    {
      id: 'length',
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      passed: password.length >= PASSWORD_MIN_LENGTH,
      required: true,
    },
    { id: 'lower', label: 'A lowercase letter', passed: /[a-z]/.test(password), required: true },
    { id: 'upper', label: 'An uppercase letter', passed: /[A-Z]/.test(password), required: true },
    { id: 'number', label: 'A number', passed: /\d/.test(password), required: true },
    {
      id: 'symbol',
      label: 'A symbol (for example ! @ # $)',
      passed: /[^A-Za-z0-9]/.test(password),
      required: false,
    },
  ]
}

// Returns { score } from 0 (empty) to 4 (strong).
export function getPasswordStrength(password) {
  if (!password) return { score: 0 }

  const checks = getPasswordChecks(password)
  const lengthPassed = checks[0].passed

  // Too short is always "weak", whatever else it contains
  if (!lengthPassed) return { score: 1 }

  let points = checks.filter((check) => check.passed).length // 1 to 5
  if (password.length >= 12) points += 1 // bonus for a long password

  if (points <= 2) return { score: 1 } // weak
  if (points === 3) return { score: 2 } // fair
  if (points === 4) return { score: 3 } // good
  return { score: 4 } // strong
}