import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Factory, ShieldAlert, KeyRound } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

type Role = "employee" | "supervisor";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const employees = useStore((state) => state.employees);

  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!employeeId.trim()) {
      setError("请输入工号");
      setIsLoading(false);
      return;
    }

    const user = login(employeeId.trim().toUpperCase());

    if (!user) {
      setError("工号不存在，请检查后重试");
      setIsLoading(false);
      return;
    }

    const isSupervisorRole = role === "supervisor";
    if (isSupervisorRole && !user.isSupervisor) {
      setError("该工号无主管权限，请选择员工登录");
      setIsLoading(false);
      return;
    }

    if (!isSupervisorRole && user.isSupervisor) {
      setError("该工号为主管账号，请选择主管登录");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate(user.isSupervisor ? "/dashboard" : "/employee");
  };

  const demoAccounts = [
    { id: "E001", name: "张三", role: "employee" as Role, desc: "焊接工 · 一车间" },
    { id: "E003", name: "王五", role: "employee" as Role, desc: "喷漆工 · 二车间" },
    { id: "S001", name: "陈主管", role: "supervisor" as Role, desc: "一车间主管" },
    { id: "S002", name: "刘主管", role: "supervisor" as Role, desc: "二车间主管" },
  ];

  const handleDemoLogin = (account: (typeof demoAccounts)[0]) => {
    setEmployeeId(account.id);
    setRole(account.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-6">
            <Factory className="text-primary-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">劳保用品管理系统</h1>
          <p className="text-primary-200">PPE Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setRole("employee")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all",
                role === "employee"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <User size={18} />
              员工登录
            </button>
            <button
              onClick={() => setRole("supervisor")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all",
                role === "supervisor"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ShieldAlert size={18} />
              主管登录
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                工号
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="请输入您的工号，如 E001"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200",
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-primary-700 active:scale-[0.98] hover:shadow-lg"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登 录"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">演示账号（点击快速登录）</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts
                .filter((a) => a.role === role)
                .map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleDemoLogin(account)}
                    className="p-3 text-left bg-gray-50 hover:bg-primary-50 rounded-xl transition-all group"
                  >
                    <p className="text-sm font-medium text-gray-800 group-hover:text-primary-700">
                      {account.id} - {account.name}
                    </p>
                    <p className="text-xs text-gray-500">{account.desc}</p>
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl">
            <p className="text-xs text-primary-700 font-medium mb-1">💡 使用说明</p>
            <ul className="text-xs text-primary-600 space-y-1">
              <li>• 员工账号以 E 开头，主管账号以 S 开头</li>
              <li>• 系统根据岗位自动控制每月可领数量</li>
              <li>• 代领需输入被代领人工号</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-primary-300 text-sm mt-6">
          © {new Date().getFullYear()} 工厂劳保用品管理系统
        </p>
      </div>
    </div>
  );
};
