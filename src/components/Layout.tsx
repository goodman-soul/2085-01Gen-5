import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Package, BarChart3, User } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useStore((state) => state.currentUser);
  const positions = useStore((state) => state.positions);
  const workshops = useStore((state) => state.workshops);
  const logout = useStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const position = positions.find((p) => p.id === currentUser?.positionId);
  const workshop = workshops.find((w) => w.id === currentUser?.workshopId);

  const navItems = currentUser?.isSupervisor
    ? [
        { path: "/dashboard", label: "仪表盘", icon: <LayoutDashboard size={20} /> },
        { path: "/summary", label: "消耗汇总", icon: <BarChart3 size={20} /> },
      ]
    : [{ path: "/employee", label: "领取用品", icon: <Package size={20} /> }];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏭</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">劳保用品管理系统</h1>
                <p className="text-xs text-gray-500">PPE Management System</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="text-primary-600" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser?.name} ({currentUser?.id})
                  </p>
                  <p className="text-xs text-gray-500">
                    {position?.name} · {workshop?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm">退出</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="md:hidden border-t border-gray-100 px-4 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                  location.pathname === item.path
                    ? "text-primary-700"
                    : "text-gray-500"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
