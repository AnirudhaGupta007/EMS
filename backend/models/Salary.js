import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Paid", "Unpaid"],
        default: "Unpaid"
    },
    paymentDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true
    },
    paymentMonth: {
        type: String,
        required: true
    },
    paymentYear: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
salarySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate net salary before saving
salarySchema.pre("save", function (next) {
    this.netSalary = this.baseSalary + this.bonus - this.deductions;
    next();
});

// Ensure unique salary record per employee per month/year
salarySchema.index({ employeeId: 1, paymentMonth: 1, paymentYear: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);