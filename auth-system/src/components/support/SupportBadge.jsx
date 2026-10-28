import Badge from "../ui/Badge";
import { supportStatusMeta } from "../../utils/supportLabels";

function SupportBadge({ status }) {
  const meta = supportStatusMeta(status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export default SupportBadge;
