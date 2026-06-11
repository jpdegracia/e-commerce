import { Request, Response } from "express"
import { cartServices } from "../services/cartServices"

export const addItemToCartBasket = async (req: Request, res: Response) => {
    try {
        // extract userId from verifyToken middleware
        const userId = (req as any).user.id;
        const { productId, quantity } = req.body

        const cart = await cartServices.addItemToCart(userId, productId, Number(quantity))
        res.status(200).json({
            message: "Items added to cart basket successfully",
            details: cart
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to add items to cart", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error})
        }
    }
}


export const getCartInfo = async (req: Request, res: Response) => {
    try {
        //extracting userId from verifiedToken middleware
        const userId = (req as any).user.id;

        const cart = await cartServices.getCart(userId)
        res.status(200).json({
            message: "Item products being added in the cart",
            details: cart
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Fetching cart failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error})
        }
    }
}

export const updateCartItems = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId, quantity } = req.body
        
        const updatedCart = await cartServices.updateItemQuantity(userId, productId, Number(quantity))
        res.status(200).json({
            message: "Cart item quantity updated successfully",
            details: updatedCart
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Updating cart items failed", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
}

export const removeCartItems = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const productId = req.params.productId as string;

        const removedCart = await cartServices.removeItemFromCart(userId, productId)
        res.status(200).json({
            message: "Item removed from the cart successfully",
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Removing items in the cart failed", error: error.message})
        } else {
            res.status(500).json({ message: "Server Error", error})
        }
    }
}


