
import mongoose, { Schema } from "mongoose";
import IRole from "../interface/IRole";


const RoleSchema = new Schema<IRole>({
    rolename: {
        type: String,
        required: [true, "Role is Required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    permissions: [{
        type: mongoose.Types.ObjectId,
        ref: "Permission"
    }]
}, {timestamps: true})

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema)
