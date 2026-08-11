import Department from "../models/Department.js";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Admin: Get all departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate({
                path: "manager",
                populate: { path: "userId", model: "User" }
            });

        const departmentsWithCount = await Promise.all(
            departments.map(async (dept) => {
                const employeeCount = await Employee.countDocuments({ department: dept._id });
                return {
                    ...dept.toObject(),
                    employeeCount,
                };
            })
        );
        res.status(200).json({ success: true, data: departmentsWithCount });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getManagers = async (req, res) => {
    try {
        const managers = await Employee.find({
            position: { $regex: /manager/i }
        }).populate({
            path: "userId",
            select: "name _id",
        });


        res.status(200).json({ success: true, data: managers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createDepartment = async (req, res) => {
    try {
        const { name, description, manager } = req.body;

        // Validate name
        if (!name || typeof name !== "string") {
            return res
                .status(400)
                .json({ success: false, message: "Department name is required and must be a string" });
        }

        // Check for duplicate
        const existing = await Department.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Department already exists" });
        }

        let managerExists = null;
        if (manager) {
            managerExists = await Employee.findById(manager);
            if (!managerExists || managerExists.position !== "Manager") {
                return res
                    .status(400)
                    .json({ success: false, message: "Selected manager is invalid" });
            }
        }

        const department = await Department.create({
            name: name.trim(),
            description: description?.trim(),
            manager: managerExists ? managerExists._id : null,
        });

        await department.populate("manager", "name position");

        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getDepartmentById = async (req, res) => {
    try {

        const departmentData = await Department.findOne({ _id: req.params.id });
        res.json({ data: departmentData })

    } catch (error) {
        res.json(error || "Couldn't fetch department name!")
    }
}
// Admin: Update department
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, manager } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }

        const department = await Department.findById(id);
        if (!department) return res.status(404).json({ success: false, message: "Department not found" });

        if (name) {
            const duplicate = await Department.findOne({ name: name.trim(), _id: { $ne: id } });
            if (duplicate) return res.status(400).json({ success: false, message: "Department name already used" });
            department.name = name.trim();
        }

        if (description) department.description = description.trim();

        department.manager = manager || null;

        await department.save();

        const updatedDept = await Department.findById(department._id).populate({
            path: "manager",
            populate: { path: "userId", select: "name _id" }
        });

        res.status(200).json({ success: true, data: updatedDept });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Admin: Delete department
export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }

        const department = await Department.findById(id);
        if (!department) return res.status(404).json({ success: false, message: "Department not found" });

        await Department.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
