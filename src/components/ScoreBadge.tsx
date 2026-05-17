import { tierClass20, tierClass100 } from "@/lib/scoring";

interface ScoreBadgeProps {
  score: number;
  max: 20 | 100;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function ScoreBadge({ score, max, size = "md" }: ScoreBadgeProps) {
  const colorClass = max === 100 ? tierClass100(score) : tierClass20(score);
  return (
    <div
      className={`${sizes[size]} ${colorClass} rounded-lg font-bold flex items-center justify-center tabular-nums`}
    >
      {score}
    </div>
  );
}
