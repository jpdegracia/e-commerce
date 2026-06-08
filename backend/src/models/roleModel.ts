
import mongoose, { Schema } from "mongoose";
import IRole from "../interface/IRole";


const RoleSchema = new Schema<IRole>({
    rolename: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    permissions: [{
        type: mongoose.Types.ObjectId,
        ref: "Permission"
    }]
}, {timestamps: true})

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema)
