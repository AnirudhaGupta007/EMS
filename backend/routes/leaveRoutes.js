import express from "express";
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getLeaveById
} from "../controllers/leaveController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee routes
router.post("/", protect, applyLeave);
router.get("/me", protect, getMyLeaves);

// Admin routes
router.get("/", protect, adminOnly, getAllLeaves);
router.get("/:id", protect, adminOnly, getLeaveById)
router.put("/:id", protect, adminOnly, updateLeaveStatus);

export default router;
