import { UserModel } from "../models/userModel";
import IUser from "../interface/IUser";
import crypto from "crypto";
import { RoleModel } from "../models/roleModel";
import mongoose from "mongoose";

class UserService {
    
    public async createUser(userData: any) {
        // 1. Check if email exists
        const existingUser = await UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error(`A user with the email '${userData.email}' already exists.`);
        }

        // 2. Smart Role Resolution for Admins
        let assignedRoleId;

        if (userData.role) {
            // Scenario A: Admin passed a direct ObjectId
            if (mongoose.Types.ObjectId.isValid(userData.role) && String(userData.role).length === 24) {
                assignedRoleId = userData.role;
            } 
            // Scenario B: Admin passed a plain text string (e.g., "Admin")
            else {
                const foundRole = await RoleModel.findOne({ rolename: userData.role });
                if (!foundRole) {
                    throw new Error(`The role '${userData.role}' does not exist in the database.`);
                }
                assignedRoleId = foundRole._id;
            }
        } else {
            // Scenario C: Admin left role blank, fallback to 'User'
            const defaultRole = await RoleModel.findOne({ rolename: 'User' });
            if (!defaultRole) {
                throw new Error("Critical Error: Default 'User' role is missing from the database.");
            }
            assignedRoleId = defaultRole._id;
        }

        // 3. Generate verification data
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 4. Safely build the user
        const newUser = new UserModel({
            fullname: userData.fullname,
            email: userData.email,
            password: userData.password,
            role: assignedRoleId, // Assigned based on admin input
            verificationToken,
            isActive: false,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        // 5. Hash & Save
        await (newUser as any).hashPassword();
        await newUser.save();

        // 6. Clean and return response
        const userResponse = newUser.toObject();
        const { password, ...cleanUser } = userResponse;
        
        return { cleanUser, verificationToken };
    }

    public async getAll() {
        
        const getAllUsers = await UserModel.find()
        .select("-password")
        .populate({
            path: "role",
            populate: {
                path: "permissions",
                model: "Permission"
            }
        });
        return getAllUsers;
    }

    public async getUserById(id: string) {

        const getUserId = await UserModel.findById(id)
        .select("-password")
        .populate({
            path: "role",
            populate: {
                path: "permissions",
                model: "Permission"
            }
        });
        return getUserId;
    }

    public async updateUser(id: string, updateData: Partial<IUser>) {

        const user = await UserModel.findByIdAndUpdate(id, updateData, {new: true, runValidators: true}).select("-password").populate("role");
        if (!user) {
            throw new Error("User not found or update failed.")
        }
        return user;
    }

    public async deleteUser(id: string) {
        const user = await UserModel.findByIdAndDelete(id);
        return user;
    }
}
    

export const userService = new UserService();