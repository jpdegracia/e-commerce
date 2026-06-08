import { Request, Response } from "express";
import { userService } from "../services/userServices";
import { getEmailVerificationTemplate } from "../configs/mailer/email_templates";
import nodemailer from "nodemailer";


//admin controllers
export const createUser = async (req: Request, res: Response) => {
    try {
            const { fullname, email, password, role } = req.body;
    
            const newUser = await userService.createUser({
                fullname,
                email,
                password,
                role
            } as any);
            // 3. Transporter configuration
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
    
            // Create the verification URL pointing to your backend link or frontend route
            const verifyUrl = `http://localhost:3000/auth/verify-email?token=${newUser.verificationToken}`;
    
            // 4. 🔗 Tie your template here by passing the user's fullname and link!
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome! Please Verify Your Email Address",
                html: getEmailVerificationTemplate(newUser.fullname, verifyUrl)
            };
    
            // 5. Fire off the email
            await transporter.sendMail(mailOptions);
    
            res.status(201).json({ message: "User registered Successfully", user: newUser});
        } catch (error) {
            if (error instanceof Error) {
                 res.status(400).json({ error: error.message})
            } else {
                res.status(500).json({ error: "Server Error", details: error})
            }
        }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAll();
        res.status(200).json({ message: "Retrieved All Users", details:users })
    } catch (error) {
        if ( error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found in this ID"})
        }
        res.status(200).json({ message: "Retrieved User by Id", details: user})
    } catch (error) {
        if ( error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { fullname, email, role } = req.body

        const updatedUser = await userService.updateUser(id, { fullname, email, role })

        if (!updatedUser) {
           return res.status(404).json({ error: "User not found in this ID"})
        }

        res.status(200).json({ message: "User updated successfully", details: updatedUser });

    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Server Error", details: error });
        }
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const deletedUser = await userService.deleteUser(id)

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found in this ID"})
        }
        res.status(200).json({ message: "User successfully deleted"})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Error in deleting User:", error: error.message})
        } else {
            res.status(500).json({ message: "Syntax Error", error})
        }
    }
}


