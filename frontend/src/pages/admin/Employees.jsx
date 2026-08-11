import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Upload,
  X,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import api from "../../api/axios";
import PopupNotification from "../../components/PopupNotification";
import ConfirmationDialog from "../../components/ConfirmationDialog";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [departments, setDepartments] = useState([]);

  const navigate = useNavigate();

  async function getData() {
    const fetchedDepartments = await api.get("/departments");
    console.log(fetchedDepartments.data.data);
    setDepartments(fetchedDepartments.data.data);

    const fetchedEmployees = await api.get("/employees");

    const employeesWithDeptName = fetchedEmployees.data.map((emp) => {
      const dept = fetchedDepartments.data.data.find(
        (d) => d._id === emp.department
      );
      return {
        ...emp,
        departmentName: dept ? dept.name : "Unknown",
      };
    });

    setEmployees(employeesWithDeptName);
  }
  useEffect(() => {
    getData();
  }, []);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    department: "",
    position: "",
    salary: "",
    phone: "",
    address: "",
  });

  const filteredEmployees = employees.filter(
    (employee) =>
      employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      gender: "",
      department: "",
      position: "",
      salary: "",
      phone: "",
      address: "",
    });
    setProfileImage(null);
    setProfileImagePreview(null);
    setEditingEmployee(null);
  };

  //   const handleSubmit = async () => {
  //     setLoading(true);

  //     try {
  //       const formDataToSend = new FormData();
  //       formDataToSend.append("name", formData.name);
  //       formDataToSend.append("email", formData.email);
  //       formDataToSend.append("gender", formData.gender);
  //       formDataToSend.append("department", formData.department);
  //       formDataToSend.append("position", formData.position);
  //       formDataToSend.append("salary", formData.salary);
  //       formDataToSend.append("phone", formData.phone);
  //       formDataToSend.append("address", formData.address);

  //       if (profileImage) {
  //         formDataToSend.append("profileImage", profileImage);
  //       }
  //       console.log(formDataToSend.name);
  //       if (editingEmployee) {
  //         const response = await api.put(
  //           `/employees/${editingEmployee._id}`,
  //           formDataToSend
  //         );

  //         console.log(response);
  //         setEmployees((prev) =>
  //           prev.map((emp) =>
  //             emp.id === editingEmployee.id
  //               ? { ...emp, ...formData, id: editingEmployee.id }
  //               : emp
  //           )
  //         );

  //         setNotification({
  //           type: "success",
  //           message: "Employee updated successfully!",
  //         });
  //       } else {
  //         formDataToSend.append("password", formData.password);
  //         console.log(formDataToSend);

  //         const response = await api.post("/employees", formDataToSend);

  //         setEmployees((prev) => [
  //           ...prev,
  //           {
  //             ...formData,
  //             id: response.data._id || prev.length + 1,
  //             status: "Active",
  //           },
  //         ]);

  //         setNotification({
  //           type: "success",
  //           message: "Employee added successfully!",
  //         });
  //       }

  //       resetForm();
  //       setShowAddForm(false);
  //     } catch (error) {
  //       setNotification({
  //         type: "error",
  //         message: error.response?.data?.message || "Something went wrong!",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      let response;

      if (editingEmployee) {
        response = await api.put(
          `/employees/${editingEmployee._id}`,
          formDataToSend
        );
        const updatedEmployee = response.data;

        if (!updatedEmployee || !updatedEmployee._id) return;

        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === updatedEmployee._id ? updatedEmployee : emp
          )
        );

        setNotification({
          type: "success",
          message: "Employee updated successfully!",
        });
      } else {
        formDataToSend.append("password", formData.password);
        response = await api.post("/employees", formDataToSend);

        const newEmployee = response.data.data;
        setEmployees((prev) => [...prev, newEmployee]);

        setNotification({
          type: "success",
          message: "Employee added successfully!",
        });
      }

      resetForm();
      setShowAddForm(false);
    } catch (error) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
      getData(); // ✅ refresh data
    }
  };

  const handleEdit = (employee) => {
    console.log(employee);
    setEditingEmployee(employee);

    setFormData({
      name: employee.userId?.name || "",
      email: employee.userId?.email || "",
      password: "",
      gender: employee.gender || "",
      department: employee.department?._id || employee.department || "",
      position: employee.position || "",
      salary: employee.salary?.toString() || "",
      phone: employee.phone || "",
      address: employee.address || "",
    });

    const imageUrl = employee.profileImage
      ? `http://localhost:5000/uploads/employee-profiles/${employee.profileImage}`
      : null;

    setProfileImagePreview(imageUrl);

    setShowAddForm(true);
  };

  const [dialog, setDialog] = useState({ state: false, message: "" });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedEmployeeId(id);

    setDialog({
      state: true,
      message:
        "This action cannot be undone. Please confirm that you want to proceed with this operation.",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/employees/${selectedEmployeeId}`);
      setEmployees((prev) =>
        prev.filter((emp) => emp._id !== selectedEmployeeId)
      );
      setNotification({
        type: "success",
        message: "Employee deleted successfully!",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Failed to delete employee",
      });
    } finally {
      setDialog({
        state: false,
        message: "",
      });
      setSelectedEmployeeId(null);
    }
  };

  const handleCancelDelete = () => {
    setDialog({ stat: false, message: "" });
    setSelectedEmployeeId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
  };

  if (showAddForm) {
    return (
      <div
        className="space-y-6"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-black mb-1">
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="text-sm text-gray-500">
              {editingEmployee
                ? "Update employee information"
                : "Fill in the employee details"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Profile Photo
            </label>

            {profileImagePreview ? (
              <div className="relative w-32 h-32 bg-white border-2 border-gray-200">
                <img
                  src={profileImagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-black text-white p-1 hover:bg-gray-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative w-32 h-32 bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload
                  size={24}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-xs text-gray-500 mt-2 group-hover:text-black transition-colors">
                  Upload Photo
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter email"
              />
            </div>

            {!editingEmployee && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                name="department"
                id="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">Select department</option>
                {departments.map((value, index) => (
                  <option value={value._id} key={index}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter position"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter salary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : editingEmployee
                ? "Update Employee"
                : "Add Employee"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {notification && (
        <PopupNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {dialog.state && (
        <ConfirmationDialog
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isOpen={dialog.state}
          message={dialog.message}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black mb-1">Employees</h2>
          <p className="text-sm text-gray-500">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee._id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${employee?.userId?._id}`)}
                  title="Go for a detailed view"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {employee?.userId?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">
                          {employee?.userId?.name}
                        </div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {employee?.departmentName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-gray-600 hidden md:table-cell">
                    {employee?.userId?.email}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-gray-600 hidden lg:table-cell">
                    {employee?.departmentName}
                  </td>
                  <td className="px-6 py-4 text-[12px]  text-gray-600 hidden lg:table-cell">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee);
                        }}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(employee._id);
                        }}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
        {/* <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 hover:border-black hover:text-black transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 hover:border-black hover:text-black transition-colors">
            Next
          </button>
        </div> */}
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default Employees;
