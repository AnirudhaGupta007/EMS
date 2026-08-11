import React, { useEffect, useState } from "react";
import { Plus, Users, User, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import PopupNotification from "../../components/PopupNotification";
import ConfirmationDialog from "../../components/ConfirmationDialog";

const Departments = () => {
  const [addDepartment, setAddDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: null,
  });
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [dialog, setDialog] = useState({ state: false, message: "" });
  const [selectedDepID, setSelectedDepId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedDepId(id);
    setDialog({
      state: true,
      message:
        "This action cannot be undone. Please confirm that you want to proceed with this operation.",
    });
  };
  const [notification, setNotification] = useState({
    state: false,
    message: "",
    type: "",
  });

  // Fetch managers
  const getManagers = async () => {
    try {
      const res = await api.get("/departments/managers");
      setManagers(res.data.data);
      console.log("Managers API response:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch departments
  const getDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDepartments();
    getManagers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (type, message, duration = 3000) => {
    setNotification({ state: true, type, message });
    setTimeout(() => {
      setNotification({ state: false, type: "", message: "" });
    }, duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Department name is required");

    try {
      if (editingDepartment) {
        const res = await api.put(
          `/departments/${editingDepartment._id}`,
          formData
        );
        if (res.data.success) {
          await getDepartments();
          await getManagers();

          setDepartments((prev) =>
            prev.map((d) =>
              d._id === editingDepartment._id ? res.data.data : d
            )
          );
          showNotification("success", "Department updated successfully!");
        }
      } else {
        const res = await api.post("/departments", formData);
        if (res.data.success) {
          await getDepartments();
          await getManagers();
          setDepartments((prev) => [...prev, res.data.data]);
          showNotification("success", "Department added successfully!");
        }
      }

      setFormData({ name: "", description: "", manager: "" });
      setEditingDepartment(null);
      setAddDepartment(false);
    } catch (err) {
      showNotification(
        "error",
        err.response?.data?.message || "Error occurred"
      );
    }
  };

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      manager: dept.manager?._id || "",
    });
    setAddDepartment(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/departments/${selectedDepID}`);
      setDepartments((prev) => prev.filter((d) => d._id !== selectedDepID));
      showNotification("success", "Department deleted successfully!");
    } catch (err) {
      showNotification(
        "success",
        err.response?.data?.message || "Delete failed"
      );
    } finally {
      setDialog({
        state: false,
        message: "",
      });
      setSelectedDepId(null);
    }
  };

  const handleCancelDelete = () => {
    setDialog({ stat: false, message: "" });
    setSelectedDepId(null);
  };

  const handleCancel = () => {
    setEditingDepartment(null);
    setFormData({ name: "", description: "", manager: "" });
    setAddDepartment(false);
    setNotification({ state: false, type: "", message: "" }); // reset
  };

  if (addDepartment) {
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
              {editingDepartment ? "Edit Department" : "Add Department"}
            </h2>
            <p className="text-sm text-gray-500">
              {editingDepartment
                ? "Update department info"
                : "Fill in department details"}
            </p>
          </div>
        </div>

        <form
          className="bg-white border border-gray-200 p-6 space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Department Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
              placeholder="Enter department name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Manager
            </label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="">Select manager</option>
              {managers?.map((mgr) => (
                <option key={mgr._id} value={mgr._id}>
                  {mgr.userId?.name || "No name"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {editingDepartment ? "Update Department" : "Add Department"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      {notification.state && (
        <PopupNotification
          type={notification.type}
          state={notification.state}
          message={notification.message}
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-black mb-1">
              Departments
            </h2>
            <p className="text-sm text-gray-500">
              Manage and organize your company structure
            </p>
          </div>
          <button
            onClick={() => {
              setAddDepartment(true);
              setNotification({ state: false, type: "", message: "" });
            }}
            className="bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 w-fit"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="relative bg-white border border-gray-200 p-6 hover:border-black transition-all duration-200 group"
            >
              <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                <button
                  onClick={() => handleEdit(dept)}
                  className="p-1.5 bg-gray-100 rounded hover:bg-black hover:text-white transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(dept._id)}
                  className="p-1.5 bg-gray-100 rounded hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                  <Users
                    size={22}
                    className="text-black group-hover:text-white transition-colors"
                  />
                </div>
                <span className="text-2xl font-semibold text-black">
                  {dept.employeeCount || 0}
                </span>
              </div>

              <h3 className="text-base font-semibold text-black mb-2">
                {dept.name}
              </h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                {dept.description}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <User size={16} className="text-gray-400" />
                <Link
                  // to={`/view-manager/${dept.manager?.userId?._id}`}
                  className="underline text-xs text-blue-500"
                >
                  {dept.manager?.userId?.name || "No manager"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-black mb-4">
            Department Overview
          </h3>
          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept._id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black">
                      {dept.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dept.employeeCount} employees
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div
                      className="bg-gray-500 h-2 transition-all duration-500"
                      style={{ width: `${(dept.employeeCount / 85) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Departments;
