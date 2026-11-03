import Badge from "../ui/Badge";

// "3 new messages" on a support request. Shows nothing when there are none.
function UnreadCount({ count }) {
  if (!count) return null;

  return (
    <Badge tone="brand">
      {count} new {count === 1 ? "message" : "messages"}
    </Badge>
  );
}

export default UnreadCount;
