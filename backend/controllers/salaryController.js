import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import { notifySalaryPaid } from "./notificationController.js";

// export const getSalaries = async (req, res) => {
//     try {
//         const currentMonth = new Date().toLocaleString("default", { month: "long" });
//         const currentYear = new Date().getFullYear();

//         // Get all employees
//         const employees = await Employee.find().populate("department");

//         // Ensure every employee has a salary record for current month
//         for (const emp of employees) {
//             if (!emp.department || !emp.salary) continue; // skip invalid employees

//             const exists = await Salary.findOne({
//                 employeeId: emp._id,
//                 paymentMonth: currentMonth,
//                 paymentYear: currentYear,
//             });

//             if (!exists) {
//                 await Salary.create({
//                     employeeId: emp._id,
//                     departmentId: emp.department._id,
//                     baseSalary: emp.salary,
//                     netSalary: emp.salary,
//                     paymentMonth: currentMonth,
//                     paymentYear: currentYear,
//                 });

//             }
//         }


//         // Fetch all salary records with populated details
//         const salaries = await Salary.find()
//             .populate("employeeId", "name position salary phone")
//             .populate("departmentId", "name");

//         res.status(200).json({ success: true, data: salaries });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

// Pay / update salary
// export const pay = async (req, res) => {
//     try {
//         const { id } = req.params; // salaryId
//         const { bonus = 0, deductions = 0, paymentDate, notes = "" } = req.body;

//         // Ensure numeric values
//         const bonusNum = Number(bonus);
//         const deductionsNum = Number(deductions);

//         if (isNaN(bonusNum) || isNaN(deductionsNum))
//             return res.status(400).json({ success: false, message: "Invalid bonus or deductions" });

//         const salary = await Salary.findById(id);
//         if (!salary)
//             return res.status(404).json({ success: false, message: "Salary record not found" });

//         // Update fields safely
//         salary.bonus = bonusNum;
//         salary.deductions = deductionsNum;
//         salary.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
//         salary.notes = notes;
//         salary.status = "Paid";
//         salary.netSalary = salary.baseSalary + bonusNum - deductionsNum;

//         await salary.save();

//         res.status(200).json({ success: true, message: "Salary paid successfully", data: salary });
//     } catch (err) {
//         console.error("Payment error:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

export const pay = async (req, res) => {
    try {
        const { id } = req.params; // salaryId
        const { bonus = 0, deductions = 0, paymentDate, notes = "" } = req.body;

        const bonusNum = Number(bonus);
        const deductionsNum = Number(deductions);

        if (isNaN(bonusNum) || isNaN(deductionsNum))
            return res.status(400).json({ success: false, message: "Invalid bonus or deductions" });

        const salary = await Salary.findById(id).populate({
            path: "employeeId",
            populate: { path: "userId", select: "name email" }
        });

        if (!salary)
            return res.status(404).json({ success: false, message: "Salary record not found" });

        salary.bonus = bonusNum;
        salary.deductions = deductionsNum;
        salary.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
        salary.notes = notes;
        salary.status = "Paid";
        salary.netSalary = salary.baseSalary + bonusNum - deductionsNum;

        await salary.save();

        if (salary.employeeId && salary.employeeId.userId) {
            await notifySalaryPaid(salary, salary.employeeId.userId._id);
        }

        res.status(200).json({ success: true, message: "Salary paid successfully", data: salary });
    } catch (err) {
        console.error("Payment error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find()
            .populate("departmentId", "name")
            .populate({
                path: "employeeId",
                populate: {
                    path: "userId",
                    select: "name email",
                },
                select: "position salary phone employeeId profileImage",
            }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Salaries fetched successfully",
            data: salaries,
        });
    } catch (error) {
        console.error("Error fetching salaries:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


