import { Request, Response } from "express"
import { productServices } from "../services/productServices";


export const registerProduct = async (req: Request, res: Response) => {
    try {
        const {productname, description, price, stock, images, category} = req.body;

        const product = await productServices.createProduct({
            productname,
            description,
            price,
            stock,
            images,
            category
        } as any);
        res.status(201).json({ message: "Product created Successfully", newProduct: product})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Creating product failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server error", error})
        }
    }
}

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productServices.getAllProducts()
        res.status(200).json({ message: "All Products", details: products })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Fetching Products Failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server error", error})
        }
    }
            
}

export const getProductByID = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const productID = await productServices.getProductByID(id);
        res.status(200).json({ message: "Fetching Product by ID", details: productID })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Error Fetching Product by ID", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error })
        }
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const {productname, description, price, stock, images, category} = req.body;

        const updatedProduct = await productServices.updateProduct(id, req.body)
        res.status(200).json({ message: "Product updated successfully", details: updatedProduct})
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Updating Product Failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error})
        }
    }
}

export const deleteProduct = async (req: Request, res:Response) => {
    try {
        const id = req.params.id as string;
        const deletedProduct = await productServices.deleteProduct(id);
        res.status(200).json({ message: "Deleted Product successfully" });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Deleting Product Failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error})
        }
    }
}