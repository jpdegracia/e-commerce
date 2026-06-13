import mongoose from "mongoose";

interface IUser {
    fullname: string,
    email: string,
    password: string,
    role: mongoose.Types.ObjectId,
    isActive?: boolean,
    resetPasswordToken?: string,
    resetPasswordExpires?: Date,
    verificationToken?: string,
    expiresAt?: Date
}

export default IUser;