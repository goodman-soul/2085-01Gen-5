import type { AppState, Employee, SupplyWithDetails, AlertItem, MonthlySummary } from "@/types";
import { getMonthRange } from "./date";

export const getPickedThisMonth = (
  employeeId: string,
  supplyId: string,
  records: AppState["pickupRecords"]
): number => {
  const { start, end } = getMonthRange();
  return records
    .filter(
      (r) =>
        r.employeeId === employeeId &&
        r.supplyId === supplyId &&
        r.pickupDate >= start &&
        r.pickupDate <= end
    )
    .reduce((sum, r) => sum + r.quantity, 0);
};

export const getSupplyDetails = (
  employee: Employee,
  state: AppState
): SupplyWithDetails[] => {
  return state.supplies.map((supply) => {
    const inventory = state.inventories.find((i) => i.supplyId === supply.id)!;
    const quota = state.quotas.find(
      (q) => q.positionId === employee.positionId && q.supplyId === supply.id
    ) || null;
    const pickedThisMonth = getPickedThisMonth(employee.id, supply.id, state.pickupRecords);
    const remaining = quota ? Math.max(0, quota.monthlyLimit - pickedThisMonth) : 0;

    return {
      ...supply,
      inventory,
      quota,
      pickedThisMonth,
      remaining,
    };
  });
};

export const canPickup = (
  employeeId: string,
  supplyId: string,
  quantity: number,
  state: AppState
): { allowed: boolean; reason?: string } => {
  const employee = state.employees.find((e) => e.id === employeeId);
  if (!employee) {
    return { allowed: false, reason: "员工不存在" };
  }

  const supply = state.supplies.find((s) => s.id === supplyId);
  if (!supply) {
    return { allowed: false, reason: "用品不存在" };
  }

  const inventory = state.inventories.find((i) => i.supplyId === supplyId);
  if (!inventory || inventory.quantity < quantity) {
    return { allowed: false, reason: `库存不足，当前库存：${inventory?.quantity || 0}${supply.unit}` };
  }

  const quota = state.quotas.find(
    (q) => q.positionId === employee.positionId && q.supplyId === supplyId
  );
  if (!quota || quota.monthlyLimit === 0) {
    return { allowed: false, reason: "该岗位无此用品领取权限" };
  }

  const pickedThisMonth = getPickedThisMonth(employeeId, supplyId, state.pickupRecords);
  if (pickedThisMonth + quantity > quota.monthlyLimit) {
    return {
      allowed: false,
      reason: `超出月度限额，本月已领${pickedThisMonth}${supply.unit}，限额${quota.monthlyLimit}${supply.unit}，剩余${quota.monthlyLimit - pickedThisMonth}${supply.unit}`,
    };
  }

  return { allowed: true };
};

export const getOverQuotaEmployees = (state: AppState): AlertItem[] => {
  const result: AlertItem[] = [];
  const { start } = getMonthRange();

  const employeeUsage = new Map<string, Map<string, number>>();

  state.pickupRecords
    .filter((r) => r.pickupDate >= start)
    .forEach((r) => {
      if (!employeeUsage.has(r.employeeId)) {
        employeeUsage.set(r.employeeId, new Map());
      }
      const supplyMap = employeeUsage.get(r.employeeId)!;
      supplyMap.set(r.supplyId, (supplyMap.get(r.supplyId) || 0) + r.quantity);
    });

  let overQuotaCount = 0;
  employeeUsage.forEach((supplyMap, employeeId) => {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee || employee.isSupervisor) return;

    supplyMap.forEach((quantity, supplyId) => {
      const quota = state.quotas.find(
        (q) => q.positionId === employee.positionId && q.supplyId === supplyId
      );
      if (quota && quantity >= quota.monthlyLimit * 0.9) {
        overQuotaCount++;
      }
    });
  });

  if (overQuotaCount > 0) {
    result.push({
      type: "over_quota",
      title: "超额领取预警",
      description: `${overQuotaCount}名员工本月领取量已达或超过限额的90%`,
      count: overQuotaCount,
    });
  }

  return result;
};

export const getProxyRecords = (state: AppState): AlertItem[] => {
  const { start } = getMonthRange();
  const proxyCount = state.pickupRecords.filter(
    (r) => r.isProxy && r.pickupDate >= start
  ).length;

  if (proxyCount > 0) {
    return [
      {
        type: "proxy",
        title: "代领记录",
        description: `本月共有${proxyCount}笔代领记录，请关注是否存在违规代领`,
        count: proxyCount,
      },
    ];
  }
  return [];
};

export const getLowStockItems = (state: AppState): AlertItem[] => {
  const lowStockItems = state.inventories.filter((i) => i.quantity <= i.threshold);

  if (lowStockItems.length > 0) {
    return [
      {
        type: "low_stock",
        title: "库存告急",
        description: `${lowStockItems.length}种用品库存已低于预警阈值，请及时补货`,
        count: lowStockItems.length,
      },
    ];
  }
  return [];
};

export const getAllAlerts = (state: AppState): AlertItem[] => {
  return [...getOverQuotaEmployees(state), ...getProxyRecords(state), ...getLowStockItems(state)];
};

export const getMonthlySummary = (state: AppState, monthDate: Date = new Date()): MonthlySummary[] => {
  const { start, end } = getMonthRange(monthDate);
  const summaries: Map<string, MonthlySummary> = new Map();

  state.workshops.forEach((workshop) => {
    summaries.set(workshop.id, {
      workshopId: workshop.id,
      workshopName: workshop.name,
      supplies: state.supplies.map((s) => ({
        supplyId: s.id,
        supplyName: s.name,
        quantity: 0,
      })),
      total: 0,
    });
  });

  state.pickupRecords
    .filter((r) => r.pickupDate >= start && r.pickupDate <= end)
    .forEach((r) => {
      const employee = state.employees.find((e) => e.id === r.employeeId);
      if (!employee) return;

      const summary = summaries.get(employee.workshopId);
      if (!summary) return;

      const supplyItem = summary.supplies.find((s) => s.supplyId === r.supplyId);
      if (supplyItem) {
        supplyItem.quantity += r.quantity;
        summary.total += r.quantity;
      }
    });

  return Array.from(summaries.values());
};
