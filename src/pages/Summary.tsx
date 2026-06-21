import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { formatMonth, getPreviousMonth, getNextMonth, getMonthKey } from "@/utils/date";
import { cn } from "@/lib/utils";

const COLORS = ["#2563EB", "#10B981", "#F97316", "#8B5CF6"];

export const Summary: React.FC = () => {
  const currentUser = useStore((state) => state.currentUser);
  const getSummary = useStore((state) => state.getSummary);
  const supplies = useStore((state) => state.supplies);
  const pickupRecords = useStore((state) => state.pickupRecords);
  const workshops = useStore((state) => state.workshops);

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const summary = useMemo(() => getSummary(selectedMonth), [selectedMonth, pickupRecords]);
  const prevMonthSummary = useMemo(() => getSummary(getPreviousMonth(selectedMonth)), [selectedMonth, pickupRecords]);

  const barChartData = useMemo(() => {
    return summary.map((item) => {
      const data: Record<string, any> = {
          name: item.workshopName,
        };
      supplies.forEach((supply) => {
        const supplyData = item.supplies.find((s) => s.supplyId === supply.id);
        data[supply.name] = supplyData?.quantity || 0;
      });
      data.合计 = item.total;
      return data;
    });
  }, [summary, supplies]);

  const pieChartData = useMemo(() => {
    return supplies.map((supply, index) => {
      const total = summary.reduce((sum, item) => {
        const supplyData = item.supplies.find((s) => s.supplyId === supply.id);
        return sum + (supplyData?.quantity || 0);
      }, 0);
      return {
        name: supply.name,
        value: total,
        emoji: supply.emoji,
        color: COLORS[index % COLORS.length],
      };
    }).filter((item) => item.value > 0);
  }, [summary, supplies]);

  const getPrevTotal = useMemo(() => {
    return prevMonthSummary.reduce((sum, item) => sum + item.total, 0);
  }, [prevMonthSummary]);

  const currentTotal = useMemo(() => {
    return summary.reduce((sum, item) => sum + item.total, 0);
  }, [summary]);

  const growthRate = getPrevTotal > 0 ? ((currentTotal - getPrevTotal) / getPrevTotal) * 100 : 0;

  const handlePrevMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    const next = getNextMonth(selectedMonth);
    if (next <= new Date()) {
      setSelectedMonth(next);
    }
  };

  const handleExport = () => {
    const headers = ["车间", ...supplies.map((s) => s.name), "合计"];
    const rows = summary.map((item) => [
      item.workshopName,
      ...item.supplies.map((s) => s.quantity),
      item.total,
    ]);

    const csvContent = [
      `劳保用品消耗汇总 - ${formatMonth(selectedMonth)}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `劳保用品消耗汇总_${getMonthKey(selectedMonth)}.csv`;
    link.click();
  };

  if (!currentUser || !currentUser.isSupervisor) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">消耗汇总</h2>
            <p className="text-gray-500 mt-1">按车间统计劳保用品月度消耗情况</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 font-medium text-gray-800 min-w-[120px] text-center">
                {formatMonth(selectedMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                disabled={getNextMonth(selectedMonth) > new Date()}
                className={cn(
                  "p-2 transition-colors",
                  getNextMonth(selectedMonth) > new Date()
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-50"
                )}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Download size={18} />
              导出报表
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <BarChart3 className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">本月总消耗</p>
                <p className="text-3xl font-bold text-gray-800">{currentTotal} 件</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">较上月</p>
              <p className={cn(
                "text-lg font-semibold",
                growthRate >= 0 ? "text-danger-600" : "text-success-600"
              )}>
                {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
              </p>
            </div>
          </div>

          {summary.map((item, index) => (
            <div
              key={item.workshopId}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <p className="text-sm text-gray-500 mb-2">{item.workshopName}</p>
              <p className="text-3xl font-bold text-gray-800">{item.total} 件</p>
              <div className="mt-4 space-y-2">
                {item.supplies.map((s) => (
                  <div key={s.supplyId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{s.supplyName}</span>
                    <span className="font-medium text-gray-800">{s.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">各车间消耗对比</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  {supplies.map((supply, index) => (
                    <Bar
                      key={supply.id}
                      dataKey={supply.name}
                      fill={COLORS[index % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">用品消耗占比</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} 件`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">详细数据</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    车间
                  </th>
                  {supplies.map((supply) => (
                    <th
                      key={supply.id}
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-700"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {supply.emoji} {supply.name}
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    合计
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.map((item, index) => (
                  <tr
                    key={item.workshopId}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      index % 2 === 1 && "bg-gray-50/50"
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {item.workshopName}
                    </td>
                    {item.supplies.map((s) => (
                      <td
                        key={s.supplyId}
                        className="px-6 py-4 text-sm text-gray-700 text-center"
                      >
                        {s.quantity}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                      {item.total}
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary-50 font-semibold">
                  <td className="px-6 py-4 text-sm text-primary-800">
                    总计
                  </td>
                  {supplies.map((supply) => {
                    const total = summary.reduce(
                      (sum, item) =>
                        sum +
                        (item.supplies.find((s) => s.supplyId === supply.id)?.quantity || 0),
                      0
                    );
                    return (
                      <td
                        key={supply.id}
                        className="px-6 py-4 text-sm text-primary-800 text-center"
                      >
                        {total}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-sm text-primary-800 text-right">
                    {currentTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </Layout>
  );
};
