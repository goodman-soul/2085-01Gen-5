import type { Employee, Position, Workshop, Supply, Quota, Inventory, PickupRecord } from "@/types";

export const positions: Position[] = [
  { id: "P001", name: "焊接工" },
  { id: "P002", name: "装配工" },
  { id: "P003", name: "喷漆工" },
  { id: "P004", name: "质检工" },
  { id: "P005", name: "主管" },
];

export const workshops: Workshop[] = [
  { id: "W001", name: "一车间" },
  { id: "W002", name: "二车间" },
];

export const employees: Employee[] = [
  { id: "E001", name: "张三", positionId: "P001", workshopId: "W001", isSupervisor: false },
  { id: "E002", name: "李四", positionId: "P002", workshopId: "W001", isSupervisor: false },
  { id: "E003", name: "王五", positionId: "P003", workshopId: "W002", isSupervisor: false },
  { id: "E004", name: "赵六", positionId: "P004", workshopId: "W002", isSupervisor: false },
  { id: "E005", name: "孙七", positionId: "P001", workshopId: "W002", isSupervisor: false },
  { id: "E006", name: "周八", positionId: "P002", workshopId: "W001", isSupervisor: false },
  { id: "S001", name: "陈主管", positionId: "P005", workshopId: "W001", isSupervisor: true },
  { id: "S002", name: "刘主管", positionId: "P005", workshopId: "W002", isSupervisor: true },
];

export const supplies: Supply[] = [
  { id: "S001", name: "手套", emoji: "🧤", unit: "副" },
  { id: "S002", name: "口罩", emoji: "😷", unit: "只" },
  { id: "S003", name: "护目镜", emoji: "🥽", unit: "副" },
  { id: "S004", name: "耳塞", emoji: "🔇", unit: "副" },
];

export const quotas: Quota[] = [
  { id: "Q001", positionId: "P001", supplyId: "S001", monthlyLimit: 10 },
  { id: "Q002", positionId: "P001", supplyId: "S002", monthlyLimit: 30 },
  { id: "Q003", positionId: "P001", supplyId: "S003", monthlyLimit: 4 },
  { id: "Q004", positionId: "P001", supplyId: "S004", monthlyLimit: 8 },
  { id: "Q005", positionId: "P002", supplyId: "S001", monthlyLimit: 8 },
  { id: "Q006", positionId: "P002", supplyId: "S002", monthlyLimit: 20 },
  { id: "Q007", positionId: "P002", supplyId: "S003", monthlyLimit: 0 },
  { id: "Q008", positionId: "P002", supplyId: "S004", monthlyLimit: 4 },
  { id: "Q009", positionId: "P003", supplyId: "S001", monthlyLimit: 6 },
  { id: "Q010", positionId: "P003", supplyId: "S002", monthlyLimit: 60 },
  { id: "Q011", positionId: "P003", supplyId: "S003", monthlyLimit: 2 },
  { id: "Q012", positionId: "P003", supplyId: "S004", monthlyLimit: 8 },
  { id: "Q013", positionId: "P004", supplyId: "S001", monthlyLimit: 4 },
  { id: "Q014", positionId: "P004", supplyId: "S002", monthlyLimit: 15 },
  { id: "Q015", positionId: "P004", supplyId: "S003", monthlyLimit: 2 },
  { id: "Q016", positionId: "P004", supplyId: "S004", monthlyLimit: 0 },
  { id: "Q017", positionId: "P005", supplyId: "S001", monthlyLimit: 2 },
  { id: "Q018", positionId: "P005", supplyId: "S002", monthlyLimit: 10 },
  { id: "Q019", positionId: "P005", supplyId: "S003", monthlyLimit: 1 },
  { id: "Q020", positionId: "P005", supplyId: "S004", monthlyLimit: 2 },
];

export const inventories: Inventory[] = [
  { id: "I001", supplyId: "S001", quantity: 500, threshold: 100 },
  { id: "I002", supplyId: "S002", quantity: 2000, threshold: 500 },
  { id: "I003", supplyId: "S003", quantity: 150, threshold: 30 },
  { id: "I004", supplyId: "S004", quantity: 300, threshold: 80 },
];

const generateHistoryRecords = (): PickupRecord[] => {
  const records: PickupRecord[] = [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const historyData = [
    { employeeId: "E001", supplyId: "S001", quantity: 8, daysAgo: 15 },
    { employeeId: "E001", supplyId: "S002", quantity: 20, daysAgo: 15 },
    { employeeId: "E001", supplyId: "S003", quantity: 2, daysAgo: 10 },
    { employeeId: "E001", supplyId: "S004", quantity: 6, daysAgo: 10 },
    { employeeId: "E002", supplyId: "S001", quantity: 6, daysAgo: 12 },
    { employeeId: "E002", supplyId: "S002", quantity: 15, daysAgo: 12 },
    { employeeId: "E002", supplyId: "S004", quantity: 3, daysAgo: 8 },
    { employeeId: "E003", supplyId: "S001", quantity: 4, daysAgo: 18 },
    { employeeId: "E003", supplyId: "S002", quantity: 50, daysAgo: 18 },
    { employeeId: "E003", supplyId: "S003", quantity: 1, daysAgo: 5 },
    { employeeId: "E003", supplyId: "S004", quantity: 7, daysAgo: 5 },
    { employeeId: "E004", supplyId: "S001", quantity: 3, daysAgo: 20 },
    { employeeId: "E004", supplyId: "S002", quantity: 12, daysAgo: 20 },
    { employeeId: "E004", supplyId: "S003", quantity: 2, daysAgo: 15 },
    { employeeId: "E005", supplyId: "S001", quantity: 9, daysAgo: 3 },
    { employeeId: "E005", supplyId: "S002", quantity: 28, daysAgo: 3 },
    { employeeId: "E006", supplyId: "S001", quantity: 7, daysAgo: 7 },
    { employeeId: "E006", supplyId: "S002", quantity: 18, daysAgo: 7, isProxy: true, proxyForId: "E002" },
  ];

  historyData.forEach((item, index) => {
    const date = new Date(thisYear, thisMonth, now.getDate() - item.daysAgo);
    records.push({
      id: `R${String(index + 1).padStart(4, "0")}`,
      employeeId: item.employeeId,
      supplyId: item.supplyId,
      quantity: item.quantity,
      pickupDate: date.toISOString().split("T")[0],
      isProxy: item.isProxy || false,
      proxyForId: item.proxyForId,
    });
  });

  return records;
};

export const pickupRecords: PickupRecord[] = generateHistoryRecords();
