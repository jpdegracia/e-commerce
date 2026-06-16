
import crypto from "crypto";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import IUser from '../interface/IUser';
import { RoleModel } from "../models/roleModel";
import mongoose from "mongoose";


interface ILogin {
    email: string;
    password: string;
}

class AuthService {

    //register
    public async authRegister(userData: any) { // Adjust type to IUser if strictly typed
        // 1. Check for existing email
        const existingUser = await UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error(`A user with the email '${userData.email}' already exists.`);
        }

        // 2. 🚀 Smart Role Resolution
        let assignedRoleId;

        if (userData.role) {
            // Scenario A: Frontend passed a valid ObjectId (e.g., from a dropdown value)
            if (mongoose.Types.ObjectId.isValid(userData.role) && String(userData.role).length === 24) {
                assignedRoleId = userData.role;
            } 
            // Scenario B: Frontend passed a plain text string (e.g., "Admin" or "User")
            else {
                const foundRole = await RoleModel.findOne({ rolename: userData.role });
                if (!foundRole) {
                    throw new Error(`The role '${userData.role}' does not exist in the database.`);
                }
                assignedRoleId = foundRole._id;
            }
        } else {
            // Scenario C: Admin left the role blank, fallback to default 'User'
            const defaultRole = await RoleModel.findOne({ rolename: 'User' });
            if (!defaultRole) {
                throw new Error("Critical Error: Default 'User' role is missing from the database.");
            }
            assignedRoleId = defaultRole._id;
        }

        // 3. Generate tokens and timestamps
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 4. Safely construct the user document without the spread operator
        const newUser = new UserModel({
            fullname: userData.fullname,
            email: userData.email,
            password: userData.password,
            role: assignedRoleId, // 🚀 Relational ObjectId securely attached!
            verificationToken,
            isActive: false,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // ⏳ 30-minute expiration
        });

        // 5. Hash and Save
        await (newUser as any).hashPassword();
        await newUser.save();

        // 6. Clean response
        const userResponse = newUser.toObject();
        const { password, ...cleanUser } = userResponse;
        
        return { cleanUser, verificationToken };
    }

    //login
    public async login(credentials: ILogin) {
        const user = await UserModel.findOne({ email: credentials.email }).populate({
            path: 'role',
            populate: { path: 'permissions' } 
        });

        if(!user) {
            throw new Error("Invalid Email or Password")
        }

        //compare password
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password)

        if(!isPasswordMatch) {
            throw new Error("Invalid Email or Password")
        }

        const secret = process.env.JWT_SECRET || "";
        const token = jwt.sign(
            { id: user._id, role: user.role},
            secret,
            {expiresIn: "1d"}

        )
        return {user, token};
    }

    //logout
    public async logout() {
        return { message: "Logged out successfully. Clear your client-side token." };
    }

    //update-profile
    public async updateProfile(id: string, updateData: Partial<IUser>) {
    const dataToUpdate = { ...updateData };

    if (dataToUpdate.password) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
    }

    // Update the database with the clean data
    const user = await UserModel.findByIdAndUpdate(id, dataToUpdate, { new: true, runValidators: true })
        .select("-password")
        .populate("role");

    if (!user) {
        throw new Error("User not found or update failed.");
    }

    return user;
}

    //verify email
    public async verifyEmail(token: string) {
        const user = await UserModel.findOne({ verificationToken: token });

        if (!user) {
            throw new Error("Invalid or expired verification token.");
        }

        // Activate the user and clear the token so it can't be reused
        user.isActive = true;
        user.verificationToken = undefined;
        user.expiresAt = undefined;
        await user.save();

        return { message: "Email verified successfully! You can now log in." };
    }

    //forgot password
    public async forgotPassword(email: string): Promise<{ message: string; resetToken: string; user: any }> {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new Error("No user found with this email address.");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await user.save();

        // Return all three keys cleanly
        return { 
            message: "Password reset link generated.", 
            resetToken, 
            user 
        };
    }
    
    //reset password
    public async resetPassword(token: string, newPassword: string) {
        // Find user by token AND ensure the expiration date is greater than ($gt) current time
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new Error("Reset token is invalid or has expired.");
        }

        // Assign the plain-text new password
        user.password = newPassword;

        // Clear out the token fields so they can't reuse the link
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Trigger your custom model method to hash the new password right before saving!
        await (user as any).hashPassword();
        await user.save();

        return { message: "Password updated successfully! You can now log in with your new password." };
    }
}

export const authService = new AuthService();