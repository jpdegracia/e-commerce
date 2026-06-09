import { Request, Response } from "express";
import { categoryServices } from "../services/categoryServices";

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { categoryname, description, image } = req.body;

        const createCategory = await categoryServices.registerCategory({
            categoryname,
            description,
            image
        } as any);
        res.status(201).json({ message: "Category created Successfully!", newCategory: createCategory })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Creating Category failed.", error: error.message })
        } else {
            res.status(500).json({ message: "Server Error", error })
        }
    }
}

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const getAllCategory = await categoryServices.getAllCategory();
        res.status(200).json({ message: "All Categories", details: getAllCategory})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Fetching Categories Failed", error: error.message })
        } else {
            res.status(500).json({ message: "Server Error", error })
        }
    }
}

export const getCategoryByID = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const categoryID = await categoryServices.getCategoryByID(id);

        res.status(200).json({ message: "Fetching Category by ID", details: categoryID})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Fetching Category by ID", error: error.message })
        } else {
            res.status(500).json({ message: "Server Error", error })
        }
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { categoryname, description, image } = req.body;

        const updatedCategory = await categoryServices.updateCategory(id, req.body)
        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found on this ID"})
        }
        res.status(200).json({ message: "Category updated successfully", details: updatedCategory})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Updating category failed", error: error.message })
        } else {
            res.status(500).json({ message: "Server Error", error })
        }
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deletedCategory = await categoryServices.deleteCategory(id)
        
        res.status(200).json({ message: "Category deleted successfully!"})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message})
        } else {
            res.status(500).json({ error: "Server Error", details: error})
        }
    }
}