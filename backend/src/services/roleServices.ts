import { RoleModel } from "../models/roleModel";
import IRole from "../interface/IRole";

class RoleService {

    public async createRole(roleData: IRole) {
        const existingRole = await RoleModel.findOne({rolename: roleData.rolename});

        if (existingRole) {
        throw new Error(`The role '${roleData.rolename}' already exists.`);
        }
        const newRole = new RoleModel(roleData);
        await newRole.save();
        return newRole;
    }

    public async getAllRoles() {
        const getAllRoles = await RoleModel.find().populate("permissions");
        return getAllRoles;
    }

    public async getRoleByID(id: string) {
        const getRoleByID = await RoleModel.findById(id).populate("permissions")
        return getRoleByID;
    }

    public async updateRole(id: string, updateData: Partial<IRole>) {
        const role = await RoleModel.findByIdAndUpdate(id, updateData, {new: true, runValidators: true});
        return role;
    }

    public async deleteRole(id: string) {
        const role = await RoleModel.findByIdAndDelete(id);
        return role;
    }
}

export const roleServices = new RoleService();