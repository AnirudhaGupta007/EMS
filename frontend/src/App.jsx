import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import "./index.css";
import Login from "./pages/Login";
import { PrivateRoute } from "./routes/PrivateRoute";
import Dashboard from "./pages/employee/Dashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import Employees from "./pages/admin/Employees";
import Departments from "./pages/admin/Departments";
import Leaves from "./pages/admin/Leaves";
import Salaries from "./pages/admin/Salaries";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/employee/Profile";

import EmployeeLayout from "./pages/employee/EmployeeLayout";
import Leave from "./pages/employee/Leaves";
import EmployeeDepartments from "./pages/employee/EmployeeDepartments";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />

        <Route element={<PrivateRoute allowedRoles={["employee"]} />}>
          <Route path="/employee/*" element={<EmployeeLayout />}>
            <Route path="profile" element={<Dashboard />} />
            <Route path="leave" element={<Leave />} />
            <Route path="departments" element={<EmployeeDepartments />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="salaries" element={<Salaries />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
