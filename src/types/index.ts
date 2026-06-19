export interface Position {
  id: string;
  name: string;
}

export interface Workshop {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  positionId: string;
  workshopId: string;
  isSupervisor: boolean;
}

export interface Supply {
  id: string;
  name: string;
  emoji: string;
  unit: string;
}

export interface Quota {
  id: string;
  positionId: string;
  supplyId: string;
  monthlyLimit: number;
}

export interface Inventory {
  id: string;
  supplyId: string;
  quantity: number;
  threshold: number;
}

export interface PickupRecord {
  id: string;
  employeeId: string;
  supplyId: string;
  quantity: number;
  pickupDate: string;
  isProxy: boolean;
  proxyForId?: string;
}

export type Role = "employee" | "supervisor";

export interface AppState {
  currentUser: Employee | null;
  employees: Employee[];
  positions: Position[];
  workshops: Workshop[];
  supplies: Supply[];
  quotas: Quota[];
  inventories: Inventory[];
  pickupRecords: PickupRecord[];
}

export interface SupplyWithDetails extends Supply {
  inventory: Inventory;
  quota: Quota | null;
  pickedThisMonth: number;
  remaining: number;
}

export interface AlertItem {
  type: "over_quota" | "proxy" | "low_stock";
  title: string;
  description: string;
  count: number;
}

export interface MonthlySummary {
  workshopId: string;
  workshopName: string;
  supplies: {
    supplyId: string;
    supplyName: string;
    quantity: number;
  }[];
  total: number;
}
