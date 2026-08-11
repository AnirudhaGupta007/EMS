import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import path from "path"
import fs from "fs"
import bcrypt from "bcryptjs";

// Admin: Get all employees
export const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate("userId", "profileImage name email role");
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get single employee
export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.params.id })
            .populate("userId", "name email role")
            .populate("department", "name");
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message || "wrong" });
    }
};

// Admin: Create employee
export const createEmployee = async (req, res) => {
    try {
        let { name, email, password, department, position, salary, phone, address, gender } = req.body;
        console.log(req.body)
        if (Array.isArray(password)) {
            password = password[0];
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already used" });

        const user = await User.create({ name, email, password, role: "employee" });

        const employee = await Employee.create({
            userId: user._id,
            department,
            position,
            salary,
            phone,
            address,
            gender,
            profileImage: req.file?.filename || null,
        });

        await Salary.create({
            employeeId: employee._id,
            departmentId: department,
            baseSalary: salary || 0,
            bonus: 0,
            deductions: 0,
            netSalary: salary || 0,
            status: "Unpaid",
            paymentMonth: new Date().toLocaleString("default", { month: "long" }),
            paymentYear: new Date().getFullYear(),
            paymentDate: null,
            notes: "",
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully with initial salary record",
            data: employee,
        });
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Admin: Update employee
export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const { name, email, department, gender, position, salary, phone, address } = req.body;

        const user = await User.findById(employee.userId);
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();

        employee.department = department || employee.department;
        employee.position = position || employee.position;
        employee.salary = salary || employee.salary;
        employee.phone = phone || employee.phone;
        employee.gender = gender || employee.gender;
        employee.address = address || employee.address;

        if (req.file) {
            employee.profileImage = req.file.filename; // save filename
        }

        await employee.save();
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Admin: Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        await User.findByIdAndDelete(employee.userId);
        await Employee.findByIdAndDelete(req.params.id);

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Employee: Get own profile
export const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id }).populate("userId", "name email role").populate("department", "name");
        if (!employee) return res.status(404).json({ message: "Profile not found" });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Employee: Update own profile
export const updateMyProfile = async (req, res) => {
    try {
        const employeeId = req?.user?.id;
        const { name, email, phone, address } = req.body;

        // Find employee
        const employee = await Employee.findOne({ userId: employeeId });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Update User document separately
        const userUpdates = {};
        if (name) userUpdates.name = name;
        if (email) userUpdates.email = email;

        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(employeeId, userUpdates);
        }

        // Update Employee document
        const employeeUpdates = {};
        if (phone) employeeUpdates.phone = phone;
        if (address) employeeUpdates.address = address;

        // Handle profile image
        if (req.file) {
            if (employee.profileImage) {
                const oldImagePath = path.join(
                    process.cwd(),
                    "uploads/employee-profiles",
                    employee.profileImage
                );
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            employeeUpdates.profileImage = req.file.filename;
        }

        if (Object.keys(employeeUpdates).length > 0) {
            await Employee.findByIdAndUpdate(employee._id, employeeUpdates);
        }

        const updatedEmployee = await Employee.findById(employee._id).populate('userId');

        res.status(200).json({
            message: "Profile updated successfully",
            employee: updatedEmployee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message || "Something went wrong"
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const employeeId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        const employee = await Employee.findOne({ userId: employeeId }).populate("userId");
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const isMatch = await employee.userId.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        employee.userId.password = newPassword;
        await employee.userId.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
};