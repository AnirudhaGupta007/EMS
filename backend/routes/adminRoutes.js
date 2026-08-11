import express from "express";
import { getDashboardStats, getDepartmentDistribution, getEmployeeGrowth, getLeaveRequests, getRecentEmployees, loginUser, logout } from "../controllers/authController.js";

const router = express.Router();

// router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout)
router.get("/dashboard-stats", getDashboardStats);
router.get("/employee-growth", getEmployeeGrowth);
router.get("/department-distribution", getDepartmentDistribution);
router.get("/recent-employees", getRecentEmployees);
router.get("/leave-requests", getLeaveRequests);
export default router;
