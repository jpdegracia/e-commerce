import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { authService } from "../services/authServices";
import nodemailer from "nodemailer";
import { getEmailVerificationTemplate, getPasswordResetTemplate } from "../configs/mailer/email_templates";

// 🌟 FIX: Transporter moved to global scope so ALL controllers can reuse it cleanly
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. REGISTER
export const authRegisterUser = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, role } = req.body;

        // newUser is returned from the service completely clean and without a password field!
        const {cleanUser, verificationToken} = await authService.authRegister({
            fullname,
            email,
            password,
            role
        } as any);

        console.log("GENERATED TOKEN:", verificationToken);

        const verifyUrl = `${process.env.BACKEND_URL}/auth/verify-email?token=${cleanUser.verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome! Please Verify Your Email Address",
            html: getEmailVerificationTemplate(cleanUser.fullname, verifyUrl)
        };

        await transporter.sendMail(mailOptions);

        // 🔒 FIX: Removed 'newUser.toObject()' since it's already a clean plain object!
        res.status(201).json({ message: "User registered Successfully", user: cleanUser });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Server Error", details: error });
        }
    }
}

// 2. LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const { user, token } = await authService.login({ email, password });

        const userResponse = user.toObject();
        delete (userResponse as any).password;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Server Error", details: error });
        }
    }
}

// 3. LOGOUT
export const logout = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ 
            message: "Logout successful. Please delete your client-side token." 
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error during logout." });
    }
};

// 4. VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: "Verification token is required." });
        }

        const result = await authService.verifyEmail(token as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 5. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // 🔒 Now that the service returns 'user', this line is perfectly valid!
        const { resetToken, user } = await authService.forgotPassword(email);
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "E-Commerce App - Password Reset Request",
            html: getPasswordResetTemplate((user as any).fullname, resetUrl) 
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset link sent to your email inbox." });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 6. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token and new password are required." });
        }

        const result = await authService.resetPassword(token, newPassword);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 7. UPDATE PROFILE
export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        
        const { fullname, email, password } = req.body;

        if (!fullname && !email && !password) {
            return res.status(400).json({ error: "Please provide fields to update." });
        }

        const updatedUser = await authService.updateProfile(id, { fullname, email, password });

        res.status(200).json({ 
            message: "User profile updated successfully", 
            user: updatedUser 
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Error in updating User:", error: error.message });
        } else {
            res.status(500).json({ message: "Server error", error})
        }
    }
};