// Small badge that displays a use case's priority with a colored dot
import { memo } from "react";
import { PRIORITY_OPTIONS } from "../utils/constants";

function PriorityBadge({ priority }) {
  const option = PRIORITY_OPTIONS.find((item) => item.value === priority) || PRIORITY_OPTIONS[0];

  return (
    <span className={`ui-badge ${option.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
      {priority}
    </span>
  );
}

export default memo(PriorityBadge);
