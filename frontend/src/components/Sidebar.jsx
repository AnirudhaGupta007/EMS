import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Settings,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Employees", path: "/admin/employees", icon: Users },
    { name: "Departments", path: "/admin/departments", icon: Building2 },
    { name: "Leaves", path: "/admin/leaves", icon: Calendar },
    { name: "Salaries", path: "/admin/salaries", icon: DollarSign },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white text-lg font-bold">E</span>
            </div> */}
            <span className="text-l font-semibold text-black">
              {" "}
              Eastern Prints Pvt Ltd
            </span>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li
                key={item.path}
                className="opacity-0 animate-fadeIn"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gray-50 text-black"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
