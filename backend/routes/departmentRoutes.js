import express from "express";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getManagers,
    getDepartmentById
} from "../controllers/departmentController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-departments", protect, getDepartments)


// Admin-only routes
router.get("/", protect, adminOnly, getDepartments);
router.get("/managers", protect, adminOnly, getManagers);
router.get("/:id", protect, adminOnly, getDepartmentById);


router.post("/", protect, adminOnly, createDepartment);
router.put("/:id", protect, adminOnly, updateDepartment);
router.delete("/:id", protect, adminOnly, deleteDepartment);


export default router;
