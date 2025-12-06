import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="pending" />
      <StatusBadge status="confirmed" />
      <StatusBadge status="separated" />
      <StatusBadge status="shipped" />
      <StatusBadge status="delivered" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="active" />
      <StatusBadge status="goal_reached" />
    </div>
  );
}
