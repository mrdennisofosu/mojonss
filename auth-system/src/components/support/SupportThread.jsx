import { ROLES } from "../../constants/roles";
import { formatDateTime } from "../../utils/formatDate";

// The conversation: the original message, then every reply.
function SupportThread({ request }) {
  const messages = [
    {
      id: "original",
      authorName: request.userName,
      authorRole: ROLES.USER,
      message: request.message,
      createdAt: request.createdAt,
    },
    ...request.replies,
  ];

  return (
    <ul className="space-y-3">
      {messages.map((message) => {
        const fromSupport = message.authorRole === ROLES.ADMIN;

        return (
          <li
            key={message.id}
            className={`rounded-xl p-3 text-sm ${fromSupport ? "bg-brand-50" : "bg-slate-100"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-2">
              <p className="font-semibold text-slate-900">
                {message.authorName}
                {fromSupport && (
                  <span className="ml-2 font-normal text-brand-700">
                    (Support)
                  </span>
                )}
              </p>
              <time
                dateTime={message.createdAt}
                className="text-xs text-slate-500"
              >
                {formatDateTime(message.createdAt)}
              </time>
            </div>
            <p className="mt-1 whitespace-pre-line text-slate-700">
              {message.message}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default SupportThread;
