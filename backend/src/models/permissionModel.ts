import mongoose, {Schema} from "mongoose";
import IPermission from "../interface/IPermission";

const PermissionSchema = new Schema<IPermission>({
    permissionName: {
        type: String,
        required: [true, "Permission Name is Required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "Permission description is Required"],
        trim: true,
    }
}, {timestamps: true})

export const PermissionModel = mongoose.model<IPermission>("Permission", PermissionSchema)