import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists");
            process.exit(0);
        }

        const admin = await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: "admin123", // Will be hashed by pre-save hook
            role: "admin",
        });

        console.log("🎉 Admin created successfully:");
        console.log({
            id: admin._id,
            email: admin.email,
            role: admin.role,
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        createAdmin();
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });
