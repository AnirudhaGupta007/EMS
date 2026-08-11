import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import { notifyLeaveApproved, notifyLeaveRejected, notifyLeaveRequest } from "./notificationController.js";
import User from "../models/User.js";

// Employee: apply for leave
export const applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        // Leave limits (per year)
        const leaveLimits = {
            Sick: 20,
            Casual: 10,
            Annual: 30,
        };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const yearEnd = new Date(new Date().getFullYear(), 11, 31);

        const approvedLeaves = await Leave.find({
            employeeId: employee._id,
            type,
            status: "Approved",
            startDate: { $gte: yearStart, $lte: yearEnd },
        });

        const totalUsed = approvedLeaves.reduce((sum, leave) => {
            const leaveDays =
                Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            return sum + leaveDays;
        }, 0);

        const maxAllowed = leaveLimits[type] || 0;
        if (totalUsed + daysRequested > maxAllowed) {
            return res.status(400).json({
                success: false,
                message: `You have exceeded the yearly limit for ${type} leave (${maxAllowed} days).`,
            });
        }

        // ✅ If within limit, create leave
        const leave = await Leave.create({
            employeeId: employee._id,
            departmentId: employee.department,
            type,
            startDate,
            endDate,
            reason,
        });

        await notifyLeaveRequest(leave, req.user.id);

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error("Error applying leave:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



// Employee: get own leaves
export const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const leaves = await Leave.find({ employeeId: employee._id })
            .populate("departmentId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Admin: get all leaves
export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate({
                path: "employeeId",
                populate: { path: "userId", select: "name email role" },
                select: "position",
            })
            .populate("departmentId", "name")
            .sort({ createdAt: -1 });


        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// // Admin: approve/reject leave
export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user?.id; // assuming you use auth middleware

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid leave ID" });
        }

        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        // update status
        leave.status = status;
        await leave.save();

        // ✅ Trigger notifications depending on status
        console.log(leave, leave.employeeId, adminId)
        console.log(req.user)
        if (status === "Rejected") {
            await notifyLeaveRejected(leave, leave.employeeId, adminId);
        }
        if (status === "Approved") {
            await notifyLeaveApproved(leave, leave.employeeId, adminId);
        }

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



export const getLeaveById = async (req, res) => {
    try {
        // Find the user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find the employee linked to that user
        const employee = await Employee.findOne({ userId: user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Get all leaves for that employee
        const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error("Error fetching leave details:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};