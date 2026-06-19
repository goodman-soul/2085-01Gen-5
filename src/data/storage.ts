import type { AppState, Employee, PickupRecord, Inventory } from "@/types";
import { employees, positions, workshops, supplies, quotas, inventories, pickupRecords } from "./mockData";

const STORAGE_KEY = "ppe_management_system";

export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialState: AppState = {
      currentUser: null,
      employees,
      positions,
      workshops,
      supplies,
      quotas,
      inventories,
      pickupRecords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  }
};

export const getState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  }
  return JSON.parse(stored);
};

export const setState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const login = (employeeId: string): Employee | null => {
  const state = getState();
  const employee = state.employees.find((e) => e.id === employeeId);
  if (employee) {
    state.currentUser = employee;
    setState(state);
    return employee;
  }
  return null;
};

export const logout = (): void => {
  const state = getState();
  state.currentUser = null;
  setState(state);
};

export const getCurrentUser = (): Employee | null => {
  return getState().currentUser;
};

export const addPickupRecord = (record: Omit<PickupRecord, "id">): PickupRecord => {
  const state = getState();
  const newRecord: PickupRecord = {
    ...record,
    id: `R${String(state.pickupRecords.length + 1).padStart(4, "0")}`,
  };
  state.pickupRecords.push(newRecord);

  const inventory = state.inventories.find((i) => i.supplyId === record.supplyId);
  if (inventory) {
    inventory.quantity = Math.max(0, inventory.quantity - record.quantity);
  }

  setState(state);
  return newRecord;
};

export const updateInventory = (supplyId: string, quantity: number): Inventory | null => {
  const state = getState();
  const inventory = state.inventories.find((i) => i.supplyId === supplyId);
  if (inventory) {
    inventory.quantity = quantity;
    setState(state);
    return inventory;
  }
  return null;
};

export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  initializeStorage();
};
