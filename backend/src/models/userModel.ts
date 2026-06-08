import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import IUser from "../interface/IUser";


const UserSchema = new Schema<IUser>({
    fullname: { 
        type: String,
        required: true
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(emailValue: string) {
                return emailValue.includes("@") && emailValue.includes(".");
            },
            message: "Invalid Email"
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(passwordValue: string) {
                const passwordLength = passwordValue.length > 8;
                const hasUppercase = /[A-Z]/.test(passwordValue);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

                return passwordLength && hasUppercase && hasSpecialChar;
            },
            message: "Password must be 8 characters long, contains 1 uppercase and 1 special character"
        }
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role"
    },
    isActive: {
        type: Boolean,
        default: false  
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String }
    
}, {timestamps: true});

//presaved hashing of password
UserSchema.methods.hashPassword = async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
};

export const UserModel = mongoose.model<IUser>("User", UserSchema)