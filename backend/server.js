import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/adminRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import departmentRoutes from "./routes/departmentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import checkAuth from "./routes/checkAuth.js";
import salaryRoutes from "./routes/salaryRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js";

import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';




dotenv.config();
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/checkAuth", checkAuth)
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salary", salaryRoutes)
app.use("/api/notifications", notificationRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Error:", err));

app.get("/", (req, res) => res.send("Server running..."));

app.listen(5000, () => console.log("Server on port 5000"));
