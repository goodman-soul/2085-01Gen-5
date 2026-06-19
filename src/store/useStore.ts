import { create } from "zustand";
import type { AppState, Employee, PickupRecord, AlertItem, MonthlySummary, SupplyWithDetails } from "@/types";
import { getState, setState, login as storageLogin, logout as storageLogout, addPickupRecord, initializeStorage } from "@/data/storage";
import { canPickup, getAllAlerts, getMonthlySummary, getSupplyDetails } from "@/utils/validator";

interface StoreState extends AppState {
  init: () => void;
  login: (employeeId: string) => Employee | null;
  logout: () => void;
  pickup: (supplyId: string, quantity: number, isProxy: boolean, proxyForId?: string) => { success: boolean; message: string };
  getAlerts: () => AlertItem[];
  getSummary: (monthDate?: Date) => MonthlySummary[];
  getEmployeeSupplyDetails: (employee: Employee) => SupplyWithDetails[];
  refresh: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  employees: [],
  positions: [],
  workshops: [],
  supplies: [],
  quotas: [],
  inventories: [],
  pickupRecords: [],

  init: () => {
    initializeStorage();
    const state = getState();
    set(state);
  },

  login: (employeeId: string) => {
    const employee = storageLogin(employeeId);
    if (employee) {
      set({ currentUser: employee });
    }
    return employee;
  },

  logout: () => {
    storageLogout();
    set({ currentUser: null });
  },

  pickup: (supplyId: string, quantity: number, isProxy: boolean, proxyForId?: string) => {
    const state = get();
    const currentUser = state.currentUser;

    if (!currentUser) {
      return { success: false, message: "请先登录" };
    }

    const targetEmployeeId = isProxy && proxyForId ? proxyForId : currentUser.id;

    const validation = canPickup(targetEmployeeId, supplyId, quantity, state);
    if (!validation.allowed) {
      return { success: false, message: validation.reason || "领取失败" };
    }

    const record: Omit<PickupRecord, "id"> = {
      employeeId: currentUser.id,
      supplyId,
      quantity,
      pickupDate: new Date().toISOString().split("T")[0],
      isProxy,
      proxyForId,
    };

    addPickupRecord(record);
    const newState = getState();
    set(newState);

    const supply = state.supplies.find((s) => s.id === supplyId);
    return {
      success: true,
      message: isProxy
        ? `代领成功！已为工号${proxyForId}领取${quantity}${supply?.unit || ""}${supply?.name || ""}`
        : `领取成功！已领取${quantity}${supply?.unit || ""}${supply?.name || ""}`,
    };
  },

  getAlerts: () => {
    return getAllAlerts(get());
  },

  getSummary: (monthDate?: Date) => {
    return getMonthlySummary(get(), monthDate);
  },

  getEmployeeSupplyDetails: (employee: Employee) => {
    return getSupplyDetails(employee, get());
  },

  refresh: () => {
    const state = getState();
    set(state);
  },
}));
