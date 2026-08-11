// Small badge that displays a use case's status with a colored dot
import { memo } from "react";
import { STATUS_OPTIONS } from "../utils/constants";

function StatusBadge({ status }) {
  const option = STATUS_OPTIONS.find((item) => item.value === status) || STATUS_OPTIONS[0];

  return (
    <span className={`ui-badge ${option.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
      {status}
    </span>
  );
}

export default memo(StatusBadge);
