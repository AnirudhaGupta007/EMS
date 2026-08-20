import { React, useEffect, useState } from "react";
import { Users, Building2, DollarSign, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";
import Spinner from "../../components/Spinner";

export const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, empGrowthRes, deptRes, recentEmpRes, leaveRes] =
          await Promise.all([
            api.get("/auth/dashboard-stats"),
            api.get("/auth/employee-growth"),
            api.get("/auth/department-distribution"),
            api.get("/auth/recent-employees"),
            api.get("/auth/leave-requests"),
          ]);

        setStatsData(statsRes?.data);
        setEmployeeData(empGrowthRes.data);
        setDepartmentData(deptRes.data);
        setRecentEmployees(recentEmpRes.data);

        setLeaveRequests(leaveRes.data);
        console.log(leaveRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = statsData
    ? [
        {
          title: "Total Employees",
          value: statsData.totalEmployees?.toString() || "0",
          icon: Users,
        },
        {
          title: "Departments",
          value: statsData.departments?.toString() || "0",
          icon: Building2,
        },
        {
          title: "Monthly Payroll",
          value: `LKR ${statsData.monthlyPayroll?.toLocaleString() || "0"}`,
          icon: DollarSign,
        },
        {
          title: "Active Leaves",
          value: statsData.activeLeaves?.toString() || "0",
          icon: TrendingUp,
        },
      ]
    : [];

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-600 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 p-5 hover:border-black transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-50 rounded-sm flex items-center justify-center">
                <stat.icon size={18} className="text-gray-700" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-1">
              {stat.value}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-black mb-4">
            Employee Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#000"
                strokeWidth={2}
                dot={{ fill: "#000", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-black mb-4">
            Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="employees" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-black">
              Recent Employees
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentEmployees.map((employee, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-black">
                    {employee.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{employee.department}</span>
                  <span>{employee.joinDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-black">
              Leave Requests
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {leaveRequests.map((leave, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-black">
                    {leave.employee}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 ${
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{leave.type} Leave</span>
                  <span>{leave.days} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
