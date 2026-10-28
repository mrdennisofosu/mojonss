// The error every service throws when something goes wrong.
// A real API client will throw the same shape later, so pages
// can handle errors the same way in both cases.
//   message: text we can show the user
//   status:  HTTP-style code (401 = not authenticated, 403 = forbidden, ...)
//   code:    a short label for the specific problem

export class ApiError extends Error {
  constructor(message, { status = 500, code = 'UNKNOWN_ERROR' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}