import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Calendar,
  Users,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import api from "../../api/axios";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };
  useEffect(() => {
    async function getEmployeeData() {
      try {
        const { data } = await api.get("/employees/me");
        setProfile({
          name: data.userId.name,
          role: data.position,
          department: data.department.name,
          email: data.userId.email,
          phone: data.phone,
          address: data.address,
          joinDate: new Date(data.dateJoined).toLocaleDateString(),
          employeeId: data._id,
          employeeCode: data.employeeCode,
          status: data.status,
          profileImage: data.profileImage,
          salary: data.salary,
          gender: data.gender,
        });

        console.log(data);
      } catch (err) {
        console.error(err);
      }
    }
    getEmployeeData();
  }, []);

  const menuItems = [
    { path: "/employee/profile", icon: User, label: "Profile" },
    { path: "/employee/leave", icon: Calendar, label: "Leave" },
    { path: "/employee/departments", icon: Users, label: "Departments" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br text-bold text-white flex items-center justify-center from-blue-600 to-indigo-600">
                {profile?.name?.charAt(0)}
              </div>
              <span className="text-sm font-semibold tracking-tight text-gray-900">
                Employee Portal
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      size={14}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? "opacity-100" : ""
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-semibold">
                  {profile?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {profile?.name}
                </p>
                <p className="text-[10px] capitalize text-gray-500 truncate">
                  {profile?.role}
                </p>
              </div>
              <LogOut
                size={14}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
                  Welcome back, {profile?.name}
                </h1>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <img
                    className="object-cover"
                    src={`http://localhost:5000/uploads/employee-profiles/${profile?.profileImage}`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {profile?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet context={{ profile, setProfile }} />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
