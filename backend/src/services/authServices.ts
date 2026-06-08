
import crypto from "crypto";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import IUser from '../interface/IUser';


interface ILogin {
    email: string;
    password: string;
}

class AuthService {

    //register
    public async authRegister(userData: IUser) {
        const user = await UserModel.findOne({ email: userData.email});
        if (user) {
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

    //login
    public async login(credentials: ILogin) {
        const user = await UserModel.findOne({ email: credentials.email })

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
            { id: user._id},
            secret,
            {expiresIn: "1d"}

        )
        return {user, token};
    }

    //logout
    public async logout() {
        return { message: "Logged out successfully. Clear your client-side token." };
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