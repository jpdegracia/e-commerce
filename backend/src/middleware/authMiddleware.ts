import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";

// 🌟 Pro-Tip: We extend the Express Request type so TypeScript allows us to attach 'req.user'
export interface AuthRequest extends Request {
    user?: any; 
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Grab the "Authorization" header from the incoming request
        const authHeader = req.header("Authorization");

        // 2. Check if the header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        // 3. Split the string to grab just the token part (removing "Bearer ")
        const token = authHeader.split(" ")[1];

        // 4. Verify the token using your secret key (Make sure to set this in your .env file!)
        const secret = process.env.JWT_SECRET || "fallback_secret_key";
        const decoded = jwt.verify(token, secret);

        // 5. Attach the decoded payload (usually the user ID) to the request object
        req.user = decoded;

        // 6. Pass control to the next middleware or the actual controller!
        next();

    } catch (error) {
        // If jwt.verify fails (expired or tampered with), it throws an error that lands here
        res.status(403).json({ error: "Invalid or expired token." });
    }
};



export const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            // Safety check: Does the user and role exist?
            if (!user || !user.role || !user.role.permissions) {
                return res.status(403).json({ error: "Forbidden: No permissions found for this user." });
            }

            const userPermissions = user.role.permissions;

            // 🚀 MAGIC BREADCRUMB: This will force Node to print exactly what is inside [Object]
            console.log("REVEALED PERMISSIONS:", JSON.stringify(userPermissions, null, 2));

            // 🚀 THE SMART CHECK
            const hasPermission = userPermissions.some((perm: any) => {
                // If the permission is just a plain string
                if (typeof perm === 'string') return perm === requiredPermission;
                
                // If it's an object, check the most common Mongoose field names
                return perm.name === requiredPermission || 
                       perm.permissionName === requiredPermission || 
                       perm.action === requiredPermission;
            });

            if (!hasPermission) {
                return res.status(403).json({ error: `Forbidden: You lack the '${requiredPermission}' permission.` });
            }

            // If they have the permission, let them through!
            next();

        } catch (error) {
            return res.status(500).json({ error: "Permission check failed." });
        }
    };
};