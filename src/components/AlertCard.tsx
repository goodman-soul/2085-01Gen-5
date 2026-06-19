import React from "react";
import { AlertTriangle, Users, Package } from "lucide-react";
import type { AlertItem } from "@/types";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: AlertItem;
  onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const config = {
    over_quota: {
      bg: "bg-danger-50 hover:bg-danger-100",
      border: "border-danger-200",
      icon: <Users className="text-danger-500" size={24} />,
      badge: "bg-danger-500",
    },
    proxy: {
      bg: "bg-warning-50 hover:bg-warning-100",
      border: "border-warning-200",
      icon: <AlertTriangle className="text-warning-500" size={24} />,
      badge: "bg-warning-500",
    },
    low_stock: {
      bg: "bg-amber-50 hover:bg-amber-100",
      border: "border-amber-200",
      icon: <Package className="text-amber-600" size={24} />,
      badge: "bg-amber-500",
    },
  };

  const { bg, border, icon, badge } = config[alert.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer group",
        bg,
        border
      )}
    >
      <div className="absolute -top-2 -right-2">
        <span
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 text-white text-sm font-bold rounded-full animate-pulse-slow",
            badge
          )}
        >
          {alert.count}
        </span>
      </div>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 mb-1">{alert.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
        </div>
      </div>
    </div>
  );
};
