import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Download,
  Search,
  TrendingUp,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import api from "../../api/axios";
import PopupNotification from "../../components/PopupNotification";

const Salaries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    bonus: 0,
    deductions: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [salaries, setSalaries] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const { data } = await api.get("/salary");
        console.log("data", data);
        if (data.success) {
          const formatted = data.data.map((item) => ({
            id: item._id,
            employeeProfile: item?.employeeId?.profileImage || null,
            employee: item.employeeId?.userId?.name || "Unknown",
            employeeCode: item.employeeId?.employeeId || "-",
            position: item.employeeId?.position || "-",
            department: item.departmentId?.name || "-",
            baseSalary: item.baseSalary,
            bonus: item.bonus,
            deductions: item.deductions,
            netSalary: item.netSalary,
            status: item.status,
            paymentDate: item.paymentDate,
          }));
          setSalaries(formatted);
        } else {
          alert("Failed to fetch salary data");
        }
      } catch (err) {
        console.error("Error fetching salaries:", err);
        alert(err.message);
      }
    };
    fetchSalaries();
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      // Prepare payload (no netSalary, calculated on backend)
      const payload = {
        bonus: parseFloat(paymentForm.bonus || 0),
        deductions: parseFloat(paymentForm.deductions || 0),
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes,
      };

      const { data } = await api.put(`/salary/${selectedEmployee.id}`, payload);

      if (data.success) {
        // Update local state for optimistic UI
        setNotification({
          type: "success",
          message: "Salary paid successfully!",
        });
        const updatedSalaries = salaries.map((salary) =>
          salary.id === selectedEmployee.id
            ? {
                ...salary,
                ...payload,
                status: "Paid",
                netSalary: data.data.netSalary,
              }
            : salary
        );

        setSalaries(updatedSalaries);
        setShowPaymentModal(false);
        setSelectedEmployee(null);
      } else {
        setNotification({
          type: "error",
          message: data.message || "Failed to process payment",
        });
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: err || "Failed to process payment",
      });
    }
  };

  const departments = ["All", ...new Set(salaries.map((s) => s.department))];

  const filteredSalaries = salaries.filter((salary) => {
    const matchesSearch =
      salary.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || salary.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "All" || salary.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalPayroll = filteredSalaries.reduce(
    (sum, salary) => sum + salary.netSalary,
    0
  );
  const paidCount = filteredSalaries.filter((s) => s.status === "Paid").length;
  const unpaidCount = filteredSalaries.filter(
    (s) => s.status === "Unpaid"
  ).length;
  const avgSalary =
    filteredSalaries.length > 0 ? totalPayroll / filteredSalaries.length : 0;

  const getStatusColor = (status) => {
    const colors = {
      Paid: "bg-green-50 text-green-700 border-green-200",
      Unpaid: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date) => {
    if (!date) return "Not paid yet";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePayClick = (employee) => {
    setSelectedEmployee(employee);
    setPaymentForm({
      bonus: employee.bonus || 0,
      deductions: employee.deductions || 0,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowPaymentModal(true);
  };

  const calculateNetSalary = () => {
    if (!selectedEmployee) return 0;
    return (
      selectedEmployee.baseSalary +
      parseFloat(paymentForm.bonus || 0) -
      parseFloat(paymentForm.deductions || 0)
    );
  };

  // const handlePaymentSubmit = (e) => {
  //   e.preventDefault();

  //   const updatedSalaries = salaries.map((salary) => {
  //     if (salary.id === selectedEmployee.id) {
  //       return {
  //         ...salary,
  //         bonus: parseFloat(paymentForm.bonus || 0),
  //         deductions: parseFloat(paymentForm.deductions || 0),
  //         netSalary: calculateNetSalary(),
  //         status: "Paid",
  //         paymentDate: paymentForm.paymentDate,
  //       };
  //     }
  //     return salary;
  //   });

  //   setSalaries(updatedSalaries);
  //   setShowPaymentModal(false);
  //   setSelectedEmployee(null);
  // };

  const handleFormChange = (field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 lg:p-8">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <PopupNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
          * {
            font-family: 'Manrope', sans-serif;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          .animate-fadeInOverlay {
            animation: fadeInOverlay 0.3s ease-out;
          }
          .animate-delay-1 { animation-delay: 0.1s; animation-fill-mode: both; }
          .animate-delay-2 { animation-delay: 0.2s; animation-fill-mode: both; }
          .animate-delay-3 { animation-delay: 0.3s; animation-fill-mode: both; }
          .hover-lift {
            transition: all 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-4px);
            border-color: #9ca3af;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Salary Management
            </h2>
            <p className="text-xs text-gray-500">
              Manage employee compensation and payroll
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-1 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={18} className="text-gray-700" />
              <TrendingUp size={14} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              LKR {totalPayroll.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Total Payroll</p>
          </div>

          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-1 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-2 h-2 bg-green-500"></div>
              <span className="text-xs text-gray-500">
                {((paidCount / filteredSalaries.length) * 100 || 0).toFixed(0)}%
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {paidCount}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Paid</p>
          </div>

          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-1 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-2 h-2 bg-red-500"></div>
              <span className="text-xs text-gray-500">
                {((unpaidCount / filteredSalaries.length) * 100 || 0).toFixed(
                  0
                )}
                %
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {unpaidCount}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Unpaid</p>
          </div>

          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-1 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <FileText size={18} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              LKR
              {avgSalary.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Average Salary</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn animate-delay-2">
          {/* Search Field */}
          <div className="relative md:col-span-2 flex">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, position, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex min-w-0 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Cards */}
        <div className="space-y-4 animate-fadeIn animate-delay-3">
          {filteredSalaries.length === 0 ? (
            <div className="bg-white border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                No employees found matching your criteria
              </p>
            </div>
          ) : (
            filteredSalaries.map((salary) => (
              <div
                key={salary.id}
                className="bg-white border border-gray-200 p-5 hover-lift"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Employee Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                        <img
                          className="object-cover rounded-sm h-10 w-10"
                          src={`http://localhost:5000/uploads/employee-profiles/${salary.employeeProfile}`}
                          alt="Employee Profile"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {salary.employee}
                        </h4>
                        <p className="text-xs col-span-2 text-gray-500">
                          {salary.position}
                        </p>
                        <p className="text-xs text-ellipsis whitespace-nowrap text-nowrap text-gray-400 mt-0.5">
                          {salary.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Breakdown */}
                  <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Base Salary</p>
                      <p className="text-[12px] font-semibold text-gray-900">
                        LKR {salary.baseSalary.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bonus</p>
                      <p className="text-[12px] font-semibold text-green-600">
                        +LKR {salary.bonus.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deductions</p>
                      <p className="text-[12px] font-semibold text-red-600">
                        -LKR {salary.deductions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                      <p className="text-sm font-bold text-gray-900">
                        LKR {salary.netSalary.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2 sm:justify-between lg:justify-start">
                    <span
                      className={`px-2 py-1 border text-xs font-semibold ${getStatusColor(
                        salary.status
                      )}`}
                    >
                      {salary.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Calendar size={12} />
                      <span>{formatDate(salary.paymentDate)}</span>
                    </div>
                    {salary.status === "Unpaid" && (
                      <button
                        onClick={() => handlePayClick(salary)}
                        className="bg-black text-white px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors border border-black w-full sm:w-auto"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                {salary.status === "Paid" && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Total Deductions
                      </p>
                      <p className="text-xs font-medium text-gray-700">
                        LKR {salary.deductions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Employee ID
                      </p>
                      <p className="text-xs font-medium text-gray-700">
                        {salary?.employeeCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {filteredSalaries.length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 p-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredSalaries.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {salaries.length}
                </span>{" "}
                employees
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500"></div>
                  <span className="text-gray-600">{paidCount} Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500"></div>
                  <span className="text-gray-600">{unpaidCount} Unpaid</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInOverlay">
          <div className="bg-white border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex items-start justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Process Payment
                </h3>
                <p className="text-xs text-gray-500">
                  Complete payment details for {selectedEmployee.employee}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePaymentSubmit} className="p-6">
              {/* Employee Info Summary */}
              <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Employee</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedEmployee.employee}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedEmployee.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Base Salary</p>
                    <p className="text-base font-bold text-gray-900">
                      LKR {selectedEmployee.baseSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Bonus Amount
                  </label>
                  <input
                    type="number"
                    value={paymentForm.bonus}
                    onChange={(e) => handleFormChange("bonus", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    value={paymentForm.deductions}
                    onChange={(e) =>
                      handleFormChange("deductions", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      handleFormChange("paymentDate", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                    rows="3"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Salary</span>
                    <span className="font-medium text-gray-900">
                      LKR {selectedEmployee.baseSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Bonus</span>
                    <span className="font-medium">
                      +LKR {parseFloat(paymentForm.bonus || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Deductions</span>
                    <span className="font-medium">
                      -LKR
                      {parseFloat(paymentForm.deductions || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Net Salary</span>
                    <span className="font-bold text-gray-900 text-lg">
                      LKR {calculateNetSalary().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors border border-black"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;
