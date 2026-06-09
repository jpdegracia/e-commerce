import { PermissionModel } from "../models/permissionModel";
import IPermission from "../interface/IPermission";
import { RoleModel } from "../models/roleModel";

class PermissionService {

    public async createPermission(permissionData: IPermission) {
        const existingPermission = await PermissionModel.findOne({ permissionName: permissionData.permissionName})

        if (existingPermission) {
            throw new Error(`The permission '${permissionData.permissionName}' already exists`)
        }
        const newPermission = new PermissionModel(permissionData)
        await newPermission.save();
        
        const adminRole = await RoleModel.findOne({ 
            rolename: { $regex: /^admin$/i } 
        });

        if (adminRole) {
            // Push the new permission ObjectId into the admin's existing permissions array
            adminRole.permissions.push(newPermission._id as any);
            await adminRole.save();
            
            console.log(`Successfully assigned '${newPermission.permissionName}' to Admin role.`);
        } else {
            console.warn("Automation Warning: 'Admin' role document was not found in the database. Skipping auto-assignment.");
        }


        return newPermission;
    }

    public async getAllPermissions() {
        const permissions = await PermissionModel.find();
        return permissions;
    }

    public async getPermissionByID(id: string) {
        const permission = await PermissionModel.findById(id);
        return permission;
    }

    public async updatePermissions(id: string, updateData: Partial<IPermission>) {
        const permission = await PermissionModel.findByIdAndUpdate(id, updateData, {new: true, runValidators: true})
        return permission;
    }

    public async deletePermission(id: string) {
        const permission = await PermissionModel.findByIdAndDelete(id);
        return permission;
    }
    
}

export const permissionServices = new PermissionService();