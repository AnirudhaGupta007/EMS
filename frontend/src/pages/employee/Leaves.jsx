import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";

const Leaves = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [leaveForm, setLeaveForm] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 30, used: 0, remaining: 30 },
    sick: { total: 20, used: 0, remaining: 20 },
    casual: { total: 10, used: 0, remaining: 10 },
  });

  const [leaveRequests, setLeaveRequests] = useState([]);

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/leaves/me");

      if (response.data.success) {
        setLeaveRequests(response.data.data);
        calculateLeaveBalance(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || "Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveBalance = (leaves) => {
    const currentYear = new Date().getFullYear();
    const approvedLeaves = leaves.filter(
      (leave) =>
        leave.status === "Approved" &&
        new Date(leave.startDate).getFullYear() === currentYear
    );

    const balance = {
      annual: { total: 30, used: 0, remaining: 30 },
      sick: { total: 20, used: 0, remaining: 20 },
      casual: { total: 10, used: 0, remaining: 10 },
    };

    approvedLeaves.forEach((leave) => {
      const days = calculateDays(leave.startDate, leave.endDate);
      const type = leave.type.toLowerCase();

      if (balance[type]) {
        balance[type].used += days;
        balance[type].remaining = balance[type].total - balance[type].used;
      }
    });

    setLeaveBalance(balance);
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();

    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await api.post("/leaves", {
        type: leaveForm.type,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
      });

      if (response.data.success) {
        setSuccessMessage("Leave request submitted successfully!");
        setShowRequestModal(false);
        setLeaveForm({
          type: "Annual",
          startDate: "",
          endDate: "",
          reason: "",
        });

        // Refresh leave requests
        await fetchLeaveRequests();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error submitting leave:", err);
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "Pending":
        return <Clock size={16} className="text-amber-600" />;
      case "Rejected":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-gray-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your leave requests and track your balance
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Request Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-950 via-blue-600 to-blue-400 border border-blue-200 p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
              Annual Leave
            </h3>
            <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
              <Calendar size={14} className="text-blue-700" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {leaveBalance.annual.remaining}
              </span>
              <span className="text-sm text-blue-100 pb-1">
                / {leaveBalance.annual.total} days
              </span>
            </div>
            <div className="h-2 bg-blue-900 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{
                  width: `${
                    (leaveBalance.annual.remaining /
                      leaveBalance.annual.total) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-blue-100">
              {leaveBalance.annual.used} days used
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 hover:border-green-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Sick Leave
            </h3>
            <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
              <AlertCircle size={14} className="text-green-700" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {leaveBalance.sick.remaining}
              </span>
              <span className="text-sm text-gray-600 pb-1">
                / {leaveBalance.sick.total} days
              </span>
            </div>
            <div className="h-2 bg-green-200 overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${
                    (leaveBalance.sick.remaining / leaveBalance.sick.total) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {leaveBalance.sick.used} days used
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-6 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Casual Leave
            </h3>
            <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
              <Clock size={14} className="text-purple-700" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {leaveBalance.casual.remaining}
              </span>
              <span className="text-sm text-gray-600 pb-1">
                / {leaveBalance.casual.total} days
              </span>
            </div>
            <div className="h-2 bg-purple-200 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{
                  width: `${
                    (leaveBalance.casual.remaining /
                      leaveBalance.casual.total) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {leaveBalance.casual.used} days used
            </p>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            Leave Request History
          </h2>
        </div>

        {leaveRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No leave requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <div>{formatDate(request.startDate)}</div>
                        <div className="text-gray-400">
                          to {formatDate(request.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {calculateDays(request.startDate, request.endDate)} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-900 max-w-xs">
                        {request.reason}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Request Leave
              </h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Leave Type
                </label>
                <select
                  value={leaveForm.type}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, type: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none bg-white"
                  required
                  disabled={submitting}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, startDate: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none"
                    required
                    disabled={submitting}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, endDate: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none"
                    required
                    disabled={submitting}
                    min={
                      leaveForm.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Reason
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  rows={4}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none resize-none"
                  placeholder="Please provide a reason for your leave request..."
                  required
                  disabled={submitting}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> Your leave request will be sent to your
                  manager for approval. You will be notified once it's reviewed.
                </p>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleSubmitLeave}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setError(null);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
