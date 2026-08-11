import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["leave_request", "leave_approved", "leave_rejected", "salary_paid", "general"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ["Leave", "Salary", "Employee"]
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);