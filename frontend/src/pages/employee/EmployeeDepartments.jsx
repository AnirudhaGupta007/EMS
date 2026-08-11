import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, MapPin, Star } from "lucide-react";
import api from "../../api/axios";

const EmployeeDepartments = () => {
  const currentUserDepartment = "Full Stack Web Developer";
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    async function getDepData() {
      try {
        const { data } = await api.get("/departments/get-departments");
        if (data?.data) {
          setDepartments(data.data);
          setSelectedDepartment(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }
    getDepData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Departments
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore departments and connect with colleagues
        </p>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const isCurrentDept = dept.name === currentUserDepartment;
          const isSelected = selectedDepartment?._id === dept._id;
          const managerName = dept?.manager?.userId?.name || "N/A";

          return (
            <div
              key={dept._id}
              onClick={() => setSelectedDepartment(dept)}
              className={`bg-white border cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                isSelected
                  ? "border-gray-900 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              } ${isCurrentDept ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
            >
              {/* Header */}
              <div
                className={`h-24 bg-gradient-to-br from-blue-950 via-blue-600 to-blue-400 relative`}
              >
                {isCurrentDept && (
                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-white/90 backdrop-blur-sm flex items-center gap-1 rounded">
                      <Star size={12} className="text-blue-600 fill-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-600">
                        YOUR TEAM
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1 capitalize">
                  {dept.name}
                </h3>
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                  {dept.description || "No description provided"}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Size</span>
                    <span className="font-semibold text-gray-900">
                      {dept.employeeCount || 0} members
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Manager</span>
                    <span className="font-medium text-gray-900">
                      {managerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Details */}
      {selectedDepartment && (
        <div className="bg-white border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 capitalize">
                  {selectedDepartment.name} Department
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedDepartment.employeeCount} team members
                </p>
              </div>
              {selectedDepartment.name === currentUserDepartment && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 flex items-center gap-1.5">
                  <Star size={12} className="fill-blue-700" />
                  Your Department
                </span>
              )}
            </div>
          </div>

          {/* Manager Card */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Department Manager
            </h3>
            {selectedDepartment.manager ? (
              <div className="flex items-center gap-4 border p-4 bg-gray-50 rounded-md">
                <div className="w-16 h-16 bg-gray-200 overflow-hidden rounded-full flex-shrink-0">
                  <img
                    src={`http://localhost:5000/uploads/employee-profiles/${selectedDepartment.manager.profileImage}`}
                    alt={selectedDepartment.manager.userId?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {selectedDepartment.manager.userId?.name || "N/A"}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {selectedDepartment.manager.userId?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gender: {selectedDepartment.manager.gender}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No manager assigned</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDepartments;
