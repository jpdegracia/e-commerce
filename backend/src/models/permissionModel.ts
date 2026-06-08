import mongoose, {Schema} from "mongoose";
import IPermission from "../interface/IPermission";

const PermissionSchema = new Schema<IPermission>({
    permissionName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const PermissionModel = mongoose.model<IPermission>("Permission", PermissionSchema)