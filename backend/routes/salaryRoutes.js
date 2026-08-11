import express from "express";
import { getSalaries, pay } from "../controllers/salaryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getSalaries)
router.put("/:id", protect, adminOnly, pay)
export default router