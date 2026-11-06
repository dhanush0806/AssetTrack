import "./StatusBadge.css";
const StatusBadge = ({ status, className = "" }) => {
  const norm = status.toUpperCase().replace(/\s+/g, "_");
  let label = status;
  let statusClass = "badge-default";
  switch (norm) {
    case "AVAILABLE":
      label = "Available";
      statusClass = "badge-available";
      break;
    case "ASSIGNED":
      label = "Assigned";
      statusClass = "badge-assigned";
      break;
    case "UNDER_MAINTENANCE":
    case "MAINTENANCE":
      label = "Under Maintenance";
      statusClass = "badge-maintenance";
      break;
    case "RETIRED":
      label = "Retired";
      statusClass = "badge-retired";
      break;
    case "ACTIVE":
      label = "Active";
      statusClass = "badge-available";
      break;
    case "RETURNED":
      label = "Returned";
      statusClass = "badge-returned";
      break;
    case "PENDING":
      label = "Pending";
      statusClass = "badge-maintenance";
      break;
    case "IN_PROGRESS":
      label = "In Progress";
      statusClass = "badge-assigned";
      break;
    case "COMPLETED":
      label = "Completed";
      statusClass = "badge-available";
      break;
    case "EXPIRED":
      label = "Expired";
      statusClass = "badge-retired";
      break;
    case "EXPIRING_30":
      label = "Expiring (<30d)";
      statusClass = "badge-maintenance";
      break;
    case "EXPIRING_60":
      label = "Expiring (<60d)";
      statusClass = "badge-warning";
      break;
    default:
      label = status;
      statusClass = "badge-default";
  }
  return <span className={`status-badge ${statusClass} ${className}`}>
      <span className="status-dot" />
      {label}
    </span>;
};
export {
  StatusBadge
};
