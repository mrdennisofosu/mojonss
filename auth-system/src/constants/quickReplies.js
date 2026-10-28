// The ONLY messages a user can send to support. Users cannot type their own.
// effect: 'resolve' marks the request resolved, 'reopen' puts it back in progress.
// (The backend will own this same list, so the browser cannot send anything else.)

export const QUICK_REPLY_GROUPS = [
  { id: 'positive', title: 'Good news' },
  { id: 'problem', title: 'Still need help' },
  { id: 'other', title: 'Something else' },
]

export const QUICK_REPLIES = [
  { id: 'working', group: 'positive', message: "It's all working now, thank you.", effect: 'resolve' },
  { id: 'thanks', group: 'positive', message: 'Thank you, I will try that and let you know.', effect: null },
  { id: 'close', group: 'positive', message: 'You can close this request. Thank you for your help.', effect: 'resolve' },
  { id: 'still_broken', group: 'problem', message: "It's still not working.", effect: 'reopen' },
  { id: 'tried', group: 'problem', message: 'I tried that, but the problem is still there.', effect: 'reopen' },
  { id: 'more_help', group: 'other', message: 'Could you give me more details or steps to follow, please?', effect: null },
  { id: 'urgent', group: 'other', message: 'This is urgent for me. Please look at it as soon as you can.', effect: null },
]