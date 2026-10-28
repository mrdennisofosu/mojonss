// Makes a mock service wait, like a real network request would.
// This lets us build and test loading states properly.
export function delay(milliseconds = 600) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}