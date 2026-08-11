import React, { useState } from "react";
import { Calendar, Check, X, Clock, DeleteIcon } from "lucide-react";
import { useEffect } from "react";
import api from "../../api/axios.js";
import { format, differenceInDays } from "date-fns";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";

const Leaves = () => {
  const [filter, setFilter] = useState("all");

  const [leaves, setLeaves] = useState([]);
  const [idToApprove, setIdToApprove] = useState(null);
  const [dialog, setDialog] = useState({ state: false, message: "" });

  async function getLeaves() {
    const fetchedLeaves = await api.get("/leaves");
    setLeaves(fetchedLeaves.data.data);
    console.log(fetchedLeaves.data.data);
  }
  useEffect(() => {
    getLeaves();
  }, []);

  const filteredLeaves = leaves.filter((leave) =>
    filter === "all" ? true : leave.status.toLowerCase() === filter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleOpen = (id) => {
    setIdToApprove(id);
    setDialog({ message: "Are you sure to approve this leave?", state: true });
  };

  const handleConfirmApproval = async () => {
    try {
      setDialog({ message: "", state: false });

      const statusToSet = dialog.action === "reject" ? "Rejected" : "Approved";

      await api.put(`/leaves/${idToApprove}`, { status: statusToSet });

      getLeaves();
    } catch (error) {
      alert(error);
    }
  };

  const handleCancelApproval = () => {
    setDialog({ message: "", state: false });
  };
  const handleOpenReject = (id) => {
    setIdToApprove(id);
    setDialog({
      message: "Are you sure to reject this leave?",
      state: true,
      action: "reject",
    });
  };

  return (
    <>
      {dialog.state && (
        <ConfirmationDialog
          onConfirm={handleConfirmApproval}
          onCancel={handleCancelApproval}
          isOpen={dialog.state}
          message={dialog.message}
        />
      )}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-black mb-1">
              Leave Management
            </h2>
            <p className="text-sm text-gray-500">
              Review and approve leave requests
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "pending"
                ? "bg-black text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "approved"
                ? "bg-black text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "rejected"
                ? "bg-black text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="space-y-3">
          {filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-white border border-gray-200 p-5 hover:border-black transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-1">
                        {leave?.employeeId?.userId?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {leave?.departmentId?.name}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar size={16} className="text-blue-500" />
                      <span>
                        {format(new Date(leave.startDate), "MMM d")} →{" "}
                        {format(new Date(leave.endDate), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Clock size={16} className="text-green-500" />
                      <span>
                        {differenceInDays(
                          new Date(leave.endDate),
                          new Date(leave.startDate)
                        ) + 1}{" "}
                        days • {leave.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Reason:</span>{" "}
                      {leave.reason}
                    </p>
                    {leave.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpen(leave._id)}
                          className="px-4 py-1 rounded-sm bg-green-100 text-green-700 text-sm font-semibold font hover:bg-green-200 transition-colors transition-all flex items-center gap-2"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReject(leave._id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLeaves.length === 0 && (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaves;
