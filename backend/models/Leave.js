import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    type: { type: String, enum: ["Sick", "Annual", "Casual", "Paid", "Unpaid"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leave", leaveSchema);
