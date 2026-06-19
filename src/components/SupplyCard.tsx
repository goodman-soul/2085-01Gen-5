import React from "react";
import { Plus } from "lucide-react";
import type { SupplyWithDetails } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface SupplyCardProps {
  supply: SupplyWithDetails;
  onPickup: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SupplyCard: React.FC<SupplyCardProps> = ({ supply, onPickup, className, style }) => {
  const isDisabled = !supply.quota || supply.quota.monthlyLimit === 0 || supply.remaining === 0;
  const isLowStock = supply.inventory.quantity <= supply.inventory.threshold;

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
      style={style}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{supply.emoji}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{supply.name}</h3>
              <p className="text-sm text-gray-500">单位：{supply.unit}</p>
            </div>
          </div>
          {isLowStock && (
            <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
              库存告急
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">本月限额</span>
              <span className="font-medium text-gray-800">
                {supply.quota ? supply.quota.monthlyLimit : 0}
                {supply.unit}
              </span>
            </div>
            {supply.quota && supply.quota.monthlyLimit > 0 ? (
              <ProgressBar
                value={supply.pickedThisMonth}
                max={supply.quota.monthlyLimit}
                showLabel={false}
              />
            ) : (
              <div className="h-2 bg-gray-200 rounded-full" />
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">剩余可领</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  supply.remaining > 0 ? "text-success-600" : "text-gray-400"
                )}
              >
                {supply.remaining}
                {supply.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">当前库存</p>
              <p className={cn("text-xl font-bold", isLowStock ? "text-amber-600" : "text-gray-800")}>
                {supply.inventory.quantity}
                {supply.unit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onPickup}
        disabled={isDisabled}
        className={cn(
          "w-full py-3 flex items-center justify-center gap-2 font-medium transition-all duration-200",
          isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]"
        )}
      >
        <Plus size={18} />
        领取
      </button>
    </div>
  );
};
