import { Request, Response } from "express";
import { orderService } from "../services/orderServices";

// PLACE AN ORDER (CHECKOUT)
export const placeOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { shippingAddress, paymentMethod } = req.body;

        // Simple validation check before passing it down to the service layer
        if (!shippingAddress || !paymentMethod) {
            res.status(400).json({ message: "Shipping address and payment method are required." });
            return;
        }

        const newOrder = await orderService.checkoutCart(userId, shippingAddress, paymentMethod);

        res.status(201).json({
            message: "Order placed successfully!",
            details: newOrder
        });
    } catch (error) {
        if (error instanceof Error) {
            // Catches out-of-stock errors, empty cart errors, or validation issues
            res.status(400).json({ message: "Checkout failed", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
};

// USER ORDER HISTORY
export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const orders = await orderService.getUserOrderHistory(userId);

        res.status(200).json({
            message: "Order history fetched successfully.",
            details: orders
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to retrieve order history", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
};

// ADMIN: FETCH ALL STORE ORDERS
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderService.getAllStoreOrders();

        res.status(200).json({
            message: "All store orders fetched successfully.",
            details: orders
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to retrieve store orders", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
};