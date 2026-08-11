import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} from "../controllers/notificationController.js";

const router = express.Router();

// Get user notifications
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await getUserNotifications(req.user.id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

// Get unread count
router.get("/unread-count", protect, async (req, res) => {
    try {
        const count = await getUnreadCount(req.user.id);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching unread count" });
    }
});

// Mark notification as read
router.patch("/:id/read", protect, async (req, res) => {
    try {
        await markAsRead(req.params.id);
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking notification as read" });
    }
});

// Mark all as read
router.patch("/mark-all-read", protect, async (req, res) => {
    try {
        await markAllAsRead(req.user.id);
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking all as read" });
    }
});

// Delete notification
router.delete("/:id", protect, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting notification" });
    }
});

export default router;