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
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // 1. Ensure verifyToken passed along the user's ID
            // (Assuming your JWT payload contains the user's id as { id: "..." })
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: "Unauthorized. User identity missing." });
            }

            // 2. Fetch the user and deeply populate their role and permissions
            const user = await UserModel.findById(req.user.id).populate({
                path: "role",
                populate: {
                    path: "permissions",
                    model: "Permission"
                }
            });

            // 3. Handle edge cases if the user or role no longer exists
            if (!user) {
                return res.status(404).json({ error: "User not found in database." });
            }
            if (!user.role) {
                return res.status(403).json({ error: "Access Denied. No role assigned to user." });
            }

            // 4. Extract the array of permissions
            // We use 'any' here briefly because Mongoose populated fields can be tricky with TypeScript
            const userRole: any = user.role; 
            const userPermissions = userRole.permissions.map((p: any) => p.permissionName);

            // 5. Check if the user has the required permission
            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ 
                    error: `Access Denied. You do not have the '${requiredPermission}' permission.` 
                });
            }

            // 6. If they have the permission, let them through!
            next();

        } catch (error) {
            res.status(500).json({ error: "Server error during permission validation." });
        }
    };
};