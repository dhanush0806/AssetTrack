import * as Icons from "lucide-react";
import "./StatCard.css";
const StatCard = ({
  title,
  value,
  subtitle,
  iconName,
  trend,
  variant = "slate",
  onClick
}) => {
  const IconComponent = Icons[iconName] || Icons.Box;
  return <div
    className={`stat-card stat-card-${variant} ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
    onClick={onClick}
  >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon-wrapper">
          <IconComponent className="stat-card-icon" />
        </div>
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {(subtitle || trend) && <div className="stat-card-footer">
            {trend && <span
    className={`stat-trend ${trend.isNeutral ? "trend-neutral" : trend.isPositive ? "trend-positive" : "trend-negative"}`}
  >
                {trend.value}
              </span>}
            {subtitle && <span className="stat-subtitle">{subtitle}</span>}
          </div>}
      </div>
    </div>;
};
export {
  StatCard
};
