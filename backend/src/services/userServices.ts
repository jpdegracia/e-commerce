import { UserModel } from "../models/userModel";
import IUser from "../interface/IUser";
import crypto from "crypto";

class UserService {
    
    public async createUser(userData: IUser) {
        const existingUser = await UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error(`A user with the email '${userData.email}' already exists.`);
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const newUser = new UserModel({
            ...userData,
            verificationToken,
            isActive: false
        });
        await (newUser as any).hashPassword();
        await newUser.save();

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