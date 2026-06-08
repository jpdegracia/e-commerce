import { Request, Response } from "express"
import { roleServices } from "../services/roleServices";


export const createRole = async (req: Request, res: Response) => {
    try {
        const {rolename, description, permissions} = req.body;

        const newRole = await roleServices.createRole({
            rolename,
            description,
            permissions
        })
        
        res.status(201).json({ message: "Role successfully added", role: newRole})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", details: error})
        }
    }
}

export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const roles = await roleServices.getAllRoles();
        res.status(200).json({ message: "Retrieved All Roles", details: roles})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message })
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}

export const getRoleByID = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const role = await roleServices.getRoleByID(id);

        if(!role) {
            return res.status(404).json({ error: "Role not Found on this ID"})
        }
        res.status(200).json({ message: "Retrieved Role by ID", details: role})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message })
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}

export const updateRole = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { rolename, description, permissions } = req.body;

        const updatedRole = await roleServices.updateRole(id, {rolename, description, permissions})

        if (!updatedRole) {
            return res.status(404).json({ error: "Role not found in this ID"})
        }
        res.status(200).json({ message: "Role updated successfully", details: updatedRole})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message});
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleteRole = await roleServices.deleteRole(id);
        if (!deleteRole) {
            return res.status(404).json({ error: "Role not found in this ID"})
        }
        res.status(200).json({ message: "Role deleted successfully"})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message});
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}
