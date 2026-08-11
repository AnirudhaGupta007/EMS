import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Menu, X } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-amber-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 transition-all duration-300">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-black hover:text-gray-600 transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-l font-semibold text-black">
                Eastern Prints Pvt Ltd
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Admin User
              </span>
              <div className="w-9 h-9 bg-black flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
