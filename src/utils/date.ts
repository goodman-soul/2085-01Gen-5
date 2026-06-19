export const getMonthRange = (date: Date = new Date()): { start: string; end: string } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: firstDay.toISOString().split("T")[0],
    end: lastDay.toISOString().split("T")[0],
  };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatMonth = (date: Date = new Date()): string => {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });
};

export const isCurrentMonth = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

export const getMonthKey = (date: Date = new Date()): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getPreviousMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
};

export const getNextMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};
