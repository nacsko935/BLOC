import { StatTile } from "../../../core/ui/StatTile";

export function CourseStat({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return <StatTile label={label} value={value} icon={icon} />;
}
