import User from "../models/User.js";
import Employee from "../models/Employee.js";
import jwt from "jsonwebtoken";
import validator from "validator";

import Department from "../models/Department.js";
import Leave from "../models/Leave.js";
import Salary from "../models/Salary.js";
import mongoose from "mongoose";

// generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


// Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Incorrect Email Address" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect Password" });

        const token = generateToken(user);
        res.cookie("token", token, {
            // secure: process.env.NODE_ENV === "production",
            secure: false,
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



export const getDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const departments = await Department.countDocuments();

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlySalaries = await Salary.aggregate([
            { $match: { paymentDate: { $gte: monthStart }, status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } },
        ]);
        const monthlyPayroll = monthlySalaries[0]?.total || 0;

        const activeLeaves = await Leave.countDocuments({ status: "Approved" });

        res.json({ totalEmployees, departments, monthlyPayroll, activeLeaves });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Employee growth per month
export const getEmployeeGrowth = async (req, res) => {
    try {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const employees = await Employee.aggregate([
            { $match: { dateJoined: { $gte: yearStart } } },
            {
                $group: {
                    _id: { $month: "$dateJoined" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id": 1 } },
        ]);

        const growth = months.map((m, i) => {
            const monthData = employees.find((e) => e._id === i + 1);
            return { month: m, count: monthData?.count || 0 };
        });

        res.json(growth);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Department distribution
export const getDepartmentDistribution = async (req, res) => {
    try {
        const departments = await Department.find().lean();

        const distribution = await Promise.all(
            departments.map(async (dept) => {
                const count = await Employee.countDocuments({ department: dept._id });
                return { name: dept.name, employees: count };
            })
        );

        res.json(distribution);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Recent employees
export const getRecentEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .sort({ dateJoined: -1 })
            .limit(5)
            .populate("department")
            .populate("userId")
            .lean();

        const result = employees.map((e) => ({
            name: e.userId?.name || "Unknown", // populate with user name if needed
            department: e.department?.name || "N/A",
            status: e.status,
            joinDate: e.dateJoined.toISOString().split("T")[0],
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Leave requests
export const getLeaveRequests = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: "employeeId",
                populate: {
                    path: "userId",
                    select: "name email",
                },
            })
            .lean();

        const result = leaves.map((l) => ({
            employee: l.employeeId?.userId?.name || "Unknown",
            type: l.type,
            days: Math.ceil(
                (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1,
            status: l.status,
        }));


        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};