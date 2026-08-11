import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, unique: true },
    gender: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    profileImage: { type: String },
    position: { type: String },
    salary: { type: Number },
    phone: { type: String },
    address: { type: String },
    dateJoined: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

employeeSchema.pre("save", async function (next) {
    if (!this.employeeId) {
        let isUnique = false;
        let nextNumber = 1;

        const lastEmployee = await mongoose.model("Employee")
            .findOne({}, { employeeId: 1 })
            .sort({ employeeId: -1 })
            .lean();

        if (lastEmployee && lastEmployee.employeeId) {
            const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]);
            nextNumber = lastNumber + 1;
        }

        while (!isUnique) {
            const potentialId = `EMP-${String(nextNumber).padStart(4, "0")}`;
            const exists = await mongoose.model("Employee").findOne({ employeeId: potentialId });

            if (!exists) {
                this.employeeId = potentialId;
                isUnique = true;
            } else {
                nextNumber++;
            }
        }
    }
    next();
});


export default mongoose.model("Employee", employeeSchema);
