import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import PopupNotification from "../../components/PopupNotification";

const Profile = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    state: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    async function getDetails() {
      try {
        const response = await api.get(`/employees/${id}`);
        setEmployee(response.data);
        const leavesResponse = await api.get(`/leaves/${id}`);
        setLeaves(leavesResponse.data.data);
        console.log(leavesResponse.data.data);
        setLoading(false);
      } catch (error) {
        setNotification({
          state: true,
          type: "error",
          message: error || "Error fetching employee details",
        });
        console.error("Error fetching employee details:", error);
        setLoading(false);
      }
    }

    getDetails();
  }, [id, employee]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Employee Not Found
          </h2>
          <p className="text-sm text-gray-500">
            The employee you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Approved: "bg-green-50 text-green-700 border-green-200",
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getTypeColor = (type) => {
    const colors = {
      Sick: "bg-purple-50 text-purple-700 border-purple-200",
      Casual: "bg-blue-50 text-blue-700 border-blue-200",
      Annual: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Emergency: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {notification.state && (
        <PopupNotification
          type={notification.type}
          message={notification.message}
        />
      )}
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
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
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

      <button
        onClick={goBack}
        className="flex items-center gap-2 p-5 hover:text-gray-500 duration-200 transition-colors"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Employee Profile
          </h1>
          <p className="text-xs text-gray-500">
            Complete overview of employee information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 p-6 mb-5 animate-fadeIn animate-delay-1 hover-lift">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                <img
                  className="object-cover"
                  src={`http://localhost:5000/uploads/employee-profiles/${employee.profileImage}`}
                  alt={employee?.userId?.name}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl capitalize font-semibold text-gray-900 mb-0.5">
                  {employee.userId?.name || "N/A"}
                </h2>
                <p className="text-sm capitalize text-blue-950">
                  {employee.position || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm text-gray-900">
                    {employee.userId?.email || "N/A"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium">Role</p>
                  <span className="inline-block capitalize px-2 py-0.5 bg-gray-900 text-white text-xs font-medium border border-gray-900">
                    {employee.userId?.role || "N/A"}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium">
                    Department
                  </p>
                  <p className="text-sm text-gray-900">
                    {employee.department.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium">
                    Date of Joining
                  </p>
                  <p className="text-sm text-gray-900">
                    {employee.dateJoined
                      ? formatDate(employee.dateJoined)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-2 hover-lift">
            <div className="text-xs text-gray-500 font-medium mb-1">
              Phone Number
            </div>
            <div className="text-base font-semibold text-gray-900">
              {employee.phone || "N/A"}
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-2 hover-lift">
            <div className="text-xs text-gray-500 font-medium mb-1">Salary</div>
            <div className="text-base font-semibold text-gray-900">
              LKR {employee.salary?.toLocaleString() || "N/A"}
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-5 animate-fadeIn animate-delay-2 hover-lift">
            <div className="text-xs text-gray-500 font-medium mb-1">
              Employee ID
            </div>
            <div className="text-base font-semibold text-gray-900">
              {employee.employeeId || "N/A"}
            </div>
          </div>
        </div>

        {/* Address Section */}
        {employee.address && (
          <div className="bg-white border border-gray-200 p-6 mb-5 animate-fadeIn animate-delay-3 hover-lift">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Address
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {employee.address}
            </p>
          </div>
        )}

        {/* Leave History */}
        <div className="bg-white border border-gray-200 p-6 animate-fadeIn animate-delay-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Leave History
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              {leaves.length} {leaves.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No leave records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave, index) => (
                <div
                  key={leave._id || index}
                  className="border border-gray-200 p-5 hover-lift"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 border text-xs font-semibold ${getTypeColor(
                            leave.type
                          )}`}
                        >
                          {leave.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 border text-xs font-semibold ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {leave.reason}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>From: {formatDate(leave.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>To: {formatDate(leave.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Applied: {formatDate(leave.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
