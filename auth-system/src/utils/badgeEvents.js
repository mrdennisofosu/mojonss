// Small messages that parts of the app send each other.
export const SUPPORT_CHANGED = 'app:support-changed'             // new support activity: lists reload
export const ANNOUNCEMENTS_CHANGED = 'app:announcements-changed'  // a new announcement: lists reload
export const BADGES_REFRESH = 'app:badges-refresh'                // something was read: update the numbers now

export function emit(name) {
  window.dispatchEvent(new Event(name))
}