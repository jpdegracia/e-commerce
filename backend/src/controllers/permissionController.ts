import { Response, Request } from "express"
import { permissionServices } from "../services/permissionServices";



export const createPermissions = async ( req: Request, res: Response) => {
    try {
        const {permissionName, description} = req.body;

        const newPermission = await permissionServices.createPermission({
            permissionName,
            description
        })
        res.status(201).json({ message: "Permission successfully added", permission: newPermission})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", details: error})
        }
    }
}

export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const permission = await permissionServices.getAllPermissions();
        res.status(200).json({ message: "All Permissions", details: permission})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", details: error})
        }
    }
}

export const getPermissionByID = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const permissionByID = await permissionServices.getPermissionByID(id)
        if (!permissionByID) {
            return res.status(404).json({ error: "Permission not Found on this ID"})
        }
        res.status(200).json({ message: "Retrieved Permission by ID", details: permissionByID})
    } catch (error) {
        if (error instanceof Error) {
             res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", details: error})
        }
    }
}

export const updatedPermission = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { permissionName, description } = req.body;

        const updatedPermission = await permissionServices.updatePermissions(id, {permissionName, description})
        
        if (!updatedPermission) {
            return res.status(404).json({ error: "Permission not found on this ID"})
        }
        res.status(200).json({ message: "Permission updated successfully", details: updatedPermission})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message});
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}


export const deletePermission = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const deletePermission = await permissionServices.deletePermission(id)
        if (!deletePermission) {
            return res.status(404).json({ error: "Permission not found on this ID"})
        }
        res.status(200).json({ message: "Permission deleted successfully"})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}