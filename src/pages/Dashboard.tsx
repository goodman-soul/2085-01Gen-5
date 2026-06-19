import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Package, Users, AlertTriangle, ChevronRight, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { AlertCard } from "@/components/AlertCard";
import { Modal } from "@/components/Modal";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate, getMonthRange } from "@/utils/date";
import { cn } from "@/lib/utils";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const getAlerts = useStore((state) => state.getAlerts);
  const refresh = useStore((state) => state.refresh);
  const inventories = useStore((state) => state.inventories);
  const supplies = useStore((state) => state.supplies);
  const employees = useStore((state) => state.employees);
  const positions = useStore((state) => state.positions);
  const workshops = useStore((state) => state.workshops);
  const pickupRecords = useStore((state) => state.pickupRecords);
  const quotas = useStore((state) => state.quotas);

  const [activeAlertType, setActiveAlertType] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const alerts = useMemo(() => getAlerts(), [pickupRecords, inventories]);

  const stats = useMemo(() => {
    const { start } = getMonthRange();
    const monthRecords = pickupRecords.filter((r) => r.pickupDate >= start);

    const totalPickups = monthRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalEmployees = employees.filter((e) => !e.isSupervisor).length;
    const lowStockCount = inventories.filter((i) => i.quantity <= i.threshold).length;
    const proxyCount = monthRecords.filter((r) => r.isProxy).length;

    return [
      {
        title: "本月领取总量",
        value: totalPickups,
        unit: "件",
        icon: <Package className="text-primary-600" size={24} />,
        bg: "bg-primary-50",
        border: "border-primary-200",
      },
      {
        title: "员工总数",
        value: totalEmployees,
        unit: "人",
        icon: <Users className="text-success-600" size={24} />,
        bg: "bg-success-50",
        border: "border-success-200",
      },
      {
        title: "库存告急",
        value: lowStockCount,
        unit: "种",
        icon: <AlertTriangle className="text-amber-600" size={24} />,
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      {
        title: "代领记录",
        value: proxyCount,
        unit: "笔",
        icon: <TrendingUp className="text-warning-600" size={24} />,
        bg: "bg-warning-50",
        border: "border-warning-200",
      },
    ];
  }, [pickupRecords, inventories, employees]);

  const getSupplyName = (supplyId: string) => supplies.find((s) => s.id === supplyId)?.name || "";
  const getSupplyEmoji = (supplyId: string) => supplies.find((s) => s.id === supplyId)?.emoji || "";
  const getSupplyUnit = (supplyId: string) => supplies.find((s) => s.id === supplyId)?.unit || "";
  const getEmployeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name || employeeId;
  const getPositionName = (positionId: string) => positions.find((p) => p.id === positionId)?.name || "";
  const getWorkshopName = (workshopId: string) => workshops.find((w) => w.id === workshopId)?.name || "";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    refresh();
    setIsRefreshing(false);
  };

  const getAlertDetails = (type: string) => {
    const { start } = getMonthRange();

    if (type === "over_quota") {
      const overQuotaList: {
        employeeId: string;
        employeeName: string;
        position: string;
        workshop: string;
        supplies: { name: string; emoji: string; picked: number; limit: number; percentage: number }[];
      }[] = [];

      employees
        .filter((e) => !e.isSupervisor)
        .forEach((employee) => {
          const employeeSupplies: { name: string; emoji: string; picked: number; limit: number; percentage: number }[] = [];

          supplies.forEach((supply) => {
            const quota = quotas.find(
              (q) => q.positionId === employee.positionId && q.supplyId === supply.id
            );
            if (!quota || quota.monthlyLimit === 0) return;

            const picked = pickupRecords
              .filter(
                (r) =>
                  (r.employeeId === employee.id || r.proxyForId === employee.id) &&
                  r.supplyId === supply.id &&
                  r.pickupDate >= start
              )
              .reduce((sum, r) => sum + r.quantity, 0);

            const percentage = (picked / quota.monthlyLimit) * 100;
            if (percentage >= 90) {
              employeeSupplies.push({
                name: supply.name,
                emoji: supply.emoji,
                picked,
                limit: quota.monthlyLimit,
                percentage,
              });
            }
          });

          if (employeeSupplies.length > 0) {
            overQuotaList.push({
              employeeId: employee.id,
              employeeName: employee.name,
              position: getPositionName(employee.positionId),
              workshop: getWorkshopName(employee.workshopId),
              supplies: employeeSupplies,
            });
          }
        });

      return overQuotaList;
    }

    if (type === "proxy") {
      return pickupRecords
        .filter((r) => r.isProxy && r.pickupDate >= start)
        .sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime())
        .map((r) => ({
          id: r.id,
          pickupBy: getEmployeeName(r.employeeId),
          pickupById: r.employeeId,
          proxyFor: getEmployeeName(r.proxyForId || ""),
          proxyForId: r.proxyForId,
          supply: getSupplyName(r.supplyId),
          supplyEmoji: getSupplyEmoji(r.supplyId),
          quantity: r.quantity,
          unit: getSupplyUnit(r.supplyId),
          date: r.pickupDate,
        }));
    }

    if (type === "low_stock") {
      return inventories
        .filter((i) => i.quantity <= i.threshold)
        .map((i) => ({
          supplyId: i.supplyId,
          supplyName: getSupplyName(i.supplyId),
          supplyEmoji: getSupplyEmoji(i.supplyId),
          supplyUnit: getSupplyUnit(i.supplyId),
          quantity: i.quantity,
          threshold: i.threshold,
          percentage: (i.quantity / i.threshold) * 100,
        }));
    }

    return [];
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">管理仪表盘</h2>
            <p className="text-gray-500 mt-1">实时监控劳保用品领取情况</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors",
                isRefreshing && "opacity-70"
              )}
              disabled={isRefreshing}
            >
              <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
              刷新数据
            </button>
            <button
              onClick={() => navigate("/summary")}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              查看消耗汇总
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up",
                stat.bg,
                stat.border
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {stat.value}
                <span className="text-lg font-normal text-gray-500 ml-1">{stat.unit}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">预警提醒</h3>
          {alerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">一切正常</h4>
              <p className="text-gray-500">当前没有异常预警</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <AlertCard
                  key={alert.type}
                  alert={alert}
                  onClick={() => setActiveAlertType(alert.type)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">库存概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventories.map((inventory) => {
              const supply = supplies.find((s) => s.id === inventory.supplyId)!;
              const isLow = inventory.quantity <= inventory.threshold;
              return (
                <div key={inventory.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">{supply.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{supply.name}</span>
                        <span
                          className={cn(
                            "font-bold",
                            isLow ? "text-danger-600" : "text-gray-700"
                          )}
                        >
                          {inventory.quantity}
                          {supply.unit}
                        </span>
                      </div>
                      <ProgressBar
                        value={inventory.quantity}
                        max={inventory.threshold * 3}
                        color={isLow ? "danger" : "primary"}
                        showLabel={false}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        预警阈值：{inventory.threshold}
                        {supply.unit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeAlertType}
        onClose={() => setActiveAlertType(null)}
        title={
          activeAlertType === "over_quota"
            ? "超额领取明细"
            : activeAlertType === "proxy"
            ? "代领记录明细"
            : "库存告急明细"
        }
        className="max-w-3xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {activeAlertType === "over_quota" && (
            <div className="space-y-4">
              {(getAlertDetails("over_quota") as any[]).length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无超额领取人员</p>
              ) : (
                (getAlertDetails("over_quota") as any[]).map((item: any) => (
                  <div
                    key={item.employeeId}
                    className="p-4 bg-danger-50 rounded-xl border border-danger-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.employeeName} ({item.employeeId})
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.position} · {item.workshop}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {item.supplies.map((s: any) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span>{s.emoji}</span>
                          <span className="text-sm text-gray-700">{s.name}</span>
                          <span className="text-sm font-medium text-danger-600">
                            {s.picked}/{s.limit}
                          </span>
                          <span className="text-xs text-gray-500">({s.percentage.toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeAlertType === "proxy" && (
            <div className="space-y-3">
              {(getAlertDetails("proxy") as any[]).length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无代领记录</p>
              ) : (
                (getAlertDetails("proxy") as any[]).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-warning-50 rounded-xl"
                  >
                    <span className="text-2xl">{item.supplyEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">
                        <span className="text-warning-700">{item.pickupBy}</span>
                        <span className="text-gray-500"> 代 </span>
                        <span className="text-primary-700">{item.proxyFor}</span>
                        <span className="text-gray-500"> 领取 </span>
                        <span className="font-bold text-warning-600">
                          {item.quantity}{item.unit}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.supply} · {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeAlertType === "low_stock" && (
            <div className="space-y-4">
              {(getAlertDetails("low_stock") as any[]).length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无库存告急用品</p>
              ) : (
                (getAlertDetails("low_stock") as any[]).map((item: any) => (
                  <div
                    key={item.supplyId}
                    className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl"
                  >
                    <span className="text-3xl">{item.supplyEmoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{item.supplyName}</span>
                        <span className="font-bold text-amber-600">
                          {item.quantity}
                          {item.supplyUnit}
                        </span>
                      </div>
                      <ProgressBar
                        value={item.quantity}
                        max={item.threshold * 2}
                        color="danger"
                        showLabel={false}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        预警阈值：{item.threshold}
                        {item.supplyUnit}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};
