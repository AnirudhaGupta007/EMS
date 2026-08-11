import express from "express";
import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getMyProfile,
    updateMyProfile,
    changePassword
} from "../controllers/employeeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../config/multerConfig.js";

const router = express.Router();


// Employee route
router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("profileImage"), updateMyProfile)
router.put("/me/change-password", protect, changePassword);

// Admin routes
router.get("/", protect, adminOnly, getEmployees);
router.get("/:id", protect, adminOnly, getEmployeeById);
router.post("/", protect, adminOnly, upload.single("profileImage"), createEmployee);
router.put("/:id", protect, adminOnly, upload.single("profileImage"), updateEmployee);
router.delete("/:id", protect, adminOnly, deleteEmployee);


export default router;
