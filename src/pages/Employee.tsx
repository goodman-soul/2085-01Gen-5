import React, { useState, useMemo } from "react";
import { Minus, Plus, Check, History, UserX } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { SupplyCard } from "@/components/SupplyCard";
import { Modal } from "@/components/Modal";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { SupplyWithDetails } from "@/types";

export const Employee: React.FC = () => {
  const currentUser = useStore((state) => state.currentUser);
  const pickup = useStore((state) => state.pickup);
  const getEmployeeSupplyDetails = useStore((state) => state.getEmployeeSupplyDetails);
  const pickupRecords = useStore((state) => state.pickupRecords);
  const supplies = useStore((state) => state.supplies);
  const employees = useStore((state) => state.employees);
  const refresh = useStore((state) => state.refresh);

  const [selectedSupply, setSelectedSupply] = useState<SupplyWithDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProxy, setIsProxy] = useState(false);
  const [proxyForId, setProxyForId] = useState("");
  const [proxyError, setProxyError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const supplyDetails = useMemo(() => {
    if (!currentUser) return [];
    return getEmployeeSupplyDetails(currentUser);
  }, [currentUser, pickupRecords, supplies]);

  const myRecords = useMemo(() => {
    if (!currentUser) return [];
    return pickupRecords
      .filter(
        (r) => r.employeeId === currentUser.id || r.proxyForId === currentUser.id
      )
      .sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime())
      .slice(0, 10);
  }, [currentUser, pickupRecords]);

  const handlePickup = (supply: SupplyWithDetails) => {
    setSelectedSupply(supply);
    setQuantity(1);
    setIsProxy(false);
    setProxyForId("");
    setProxyError("");
  };

  const handleConfirmPickup = () => {
    if (!selectedSupply || !currentUser) return;

    if (isProxy) {
      if (!proxyForId.trim()) {
        setProxyError("请输入代领人工号");
        return;
      }
      const proxyEmployee = employees.find(
        (e) => e.id === proxyForId.trim().toUpperCase() && !e.isSupervisor
      );
      if (!proxyEmployee) {
        setProxyError("代领人工号不存在或为主管账号");
        return;
      }
      if (proxyEmployee.id === currentUser.id) {
        setProxyError("不能为自己代领");
        return;
      }
    }

    const result = pickup(
      selectedSupply.id,
      quantity,
      isProxy,
      isProxy ? proxyForId.trim().toUpperCase() : undefined
    );

    if (result.success) {
      setSuccessMessage(result.message);
      setShowSuccess(true);
      setSelectedSupply(null);
      setTimeout(() => setShowSuccess(false), 2500);
    } else {
      setProxyError(result.message);
    }
  };

  const getSupplyName = (supplyId: string) => {
    return supplies.find((s) => s.id === supplyId)?.name || "";
  };

  const getSupplyEmoji = (supplyId: string) => {
    return supplies.find((s) => s.id === supplyId)?.emoji || "";
  };

  const getSupplyUnit = (supplyId: string) => {
    return supplies.find((s) => s.id === supplyId)?.unit || "";
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || employeeId;
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">劳保用品领取</h2>
            <p className="text-gray-500 mt-1">选择需要领取的劳保用品</p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <History size={18} />
            领取记录
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supplyDetails.map((supply, index) => (
            <SupplyCard
              key={supply.id}
              supply={supply}
              onPickup={() => handlePickup(supply)}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fade-in-up"
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本月领取概况</h3>
          <div className="space-y-4">
            {supplyDetails.map((supply) =>
              supply.quota && supply.quota.monthlyLimit > 0 ? (
                <div key={supply.id} className="flex items-center gap-4">
                  <span className="text-2xl w-10">{supply.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{supply.name}</span>
                      <span className="text-gray-500">
                        {supply.pickedThisMonth}/{supply.quota.monthlyLimit}
                        {supply.unit}
                      </span>
                    </div>
                    <ProgressBar
                      value={supply.pickedThisMonth}
                      max={supply.quota.monthlyLimit}
                      showLabel={false}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedSupply}
        onClose={() => setSelectedSupply(null)}
        title={`领取${selectedSupply?.name || ""}`}
      >
        {selectedSupply && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-5xl">{selectedSupply.emoji}</span>
              <div>
                <p className="font-semibold text-gray-800 text-lg">{selectedSupply.name}</p>
                <p className="text-sm text-gray-500">
                  剩余可领：
                  <span className="text-success-600 font-medium">
                    {selectedSupply.remaining}
                    {selectedSupply.unit}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  当前库存：
                  <span
                    className={cn(
                      "font-medium",
                      selectedSupply.inventory.quantity <= selectedSupply.inventory.threshold
                        ? "text-amber-600"
                        : "text-gray-700"
                    )}
                  >
                    {selectedSupply.inventory.quantity}
                    {selectedSupply.unit}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                领取数量
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="text-3xl font-bold text-gray-800 w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedSupply.remaining, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                单位：{selectedSupply.unit}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isProxy}
                  onChange={(e) => {
                    setIsProxy(e.target.checked);
                    setProxyForId("");
                    setProxyError("");
                  }}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">代领</span>
                  <p className="text-xs text-gray-500">为其他同事代领劳保用品</p>
                </div>
              </label>

              {isProxy && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    代领人工号
                  </label>
                  <div className="relative">
                    <UserX className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={proxyForId}
                      onChange={(e) => {
                        setProxyForId(e.target.value.toUpperCase());
                        setProxyError("");
                      }}
                      placeholder="请输入被代领人工号"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      maxLength={10}
                    />
                  </div>
                </div>
              )}

              {proxyError && (
                <p className="mt-3 text-sm text-danger-600 animate-fade-in">{proxyError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSupply(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmPickup}
                className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all"
              >
                确认领取
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="我的领取记录"
        className="max-w-2xl"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {myRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无领取记录</p>
          ) : (
            myRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <span className="text-3xl">{getSupplyEmoji(record.supplyId)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">
                      {getSupplyName(record.supplyId)}
                    </p>
                    {record.isProxy && (
                      <span className="px-2 py-0.5 text-xs font-medium text-warning-700 bg-warning-100 rounded-full">
                        代领
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {record.isProxy
                      ? `代${getEmployeeName(record.proxyForId || "")}领取`
                      : `本人领取`}
                    {" · "}
                    {formatDate(record.pickupDate)}
                  </p>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  {record.quantity}
                  {getSupplyUnit(record.supplyId)}
                </p>
              </div>
            ))
          )}
        </div>
      </Modal>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in-up pointer-events-auto">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-success-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">领取成功</h3>
            <p className="text-gray-600">{successMessage}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};
