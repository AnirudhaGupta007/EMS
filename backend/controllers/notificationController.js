import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create notification
export const createNotification = async ({ recipientId, senderId, type, title, message, relatedId, relatedModel }) => {
    try {
        const notification = new Notification({
            recipientId,
            senderId,
            type,
            title,
            message,
            relatedId,
            relatedModel
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Leave request notification (to admin)
export const notifyLeaveRequest = async (leave, employeeId) => {
    try {
        // Get all admin users
        const admins = await User.find({ role: "admin" });

        const employee = await User.findById(employeeId);

        for (const admin of admins) {
            await createNotification({
                recipientId: admin._id,
                senderId: employeeId,
                type: "leave_request",
                title: "New Leave Request",
                message: `${employee.name} has requested leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
                relatedId: leave._id,
                relatedModel: "Leave"
            });
        }
    } catch (error) {
        console.error("Error notifying leave request:", error);
    }
};

// Leave approved notification (to employee)
export const notifyLeaveApproved = async (leave, employeeId, adminId) => {
    try {
        const admin = await User.findById(adminId);

        await createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: "leave_approved",
            title: "Leave Request Approved",
            message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved by ${admin.name}`,
            relatedId: leave._id,
            relatedModel: "Leave"
        });
    } catch (error) {
        console.error("Error notifying leave approval:", error);
    }
};

// Leave rejected notification (to employee)
export const notifyLeaveRejected = async (leave, employeeId, adminId) => {
    try {
        const admin = await User.findById(adminId);
        const employee = await Employee.findById(employeeId).populate("userId");

        console.log(admin, leave, employeeId, adminId)
        if (!admin || !employee) {
            console.log("Missing admin or employee info");
            return;
        }

        await createNotification({
            recipientId: employee.userId._id,
            senderId: adminId,
            type: "leave_rejected",
            title: "Leave Request Rejected",
            message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was rejected by ${admin.name}.`,
            relatedId: leave._id,
            relatedModel: "Leave"
        });



        console.log("Leave rejection notification sent");
    } catch (error) {
        console.error("Error notifying leave rejection:", error);
    }
};

// Salary paid notification (to employee)
export const notifySalaryPaid = async (salary, employeeId) => {
    try {
        await createNotification({
            recipientId: employeeId,
            type: "salary_paid",
            title: "Salary Paid",
            message: `Your salary of LKR ${salary.netSalary.toLocaleString()} has been processed and paid`,
            relatedId: salary._id,
            relatedModel: "Salary"
        });
    } catch (error) {
        console.error("Error notifying salary payment:", error);
    }
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 20) => {
    try {
        const notifications = await Notification.find({ recipientId: userId })
            .populate("senderId", "name email")
            .sort({ createdAt: -1 })
            .limit(limit);
        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    try {
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

// Mark all as read
export const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { isRead: true }
        );
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};

// Get unread count
export const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({
            recipientId: userId,
            isRead: false
        });
        return count;
    } catch (error) {
        console.error("Error getting unread count:", error);
        throw error;
    }
};