import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, (req, res) => {
    res.json({
        success: true,
        user: {
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        }
    })
})

export default router