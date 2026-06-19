import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = "primary",
  showLabel = true,
  className,
}) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const colorClasses = {
    primary: "bg-primary-600",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  const getColor = (): "primary" | "success" | "warning" | "danger" => {
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    if (percentage >= 50) return "primary";
    return "success";
  };

  const barColor = color === "primary" ? getColor() : color;

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[barColor]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>
            {value}/{max}
          </span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};
