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

// 👤 USER CONTROLLER
export const getUserOrderById = async (req: Request, res: Response) => {
    try {
        // 🚀 Force TypeScript to treat these as singular strings
        const orderId = req.params.id as string; 
        const userId = ((req as any).user?._id || (req as any).user?.id) as string;

        const order = await orderService.getOrderByIdForUser(orderId, userId);
        return res.status(200).json({ message: "Order found.", details: order });
    } catch (error: any) {
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || "Server Error" });
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
        console.log("\n==========================================");
        console.log("🚨 ADMIN GET ALL ORDERS CRASHED!");
        console.error(error);
        console.log("==========================================\n");
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to retrieve store orders", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
};

// 🚀 ADDED FOR ADMIN: GET SINGLE ORDER PROFILE BY ID
export const getAdminOrderById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const order = await orderService.getOrderById(id);
        
        if (!order) {
            res.status(404).json({ message: "No transaction ledger matches this ID." });
            return;
        }

        res.status(200).json({
            message: "Transaction retrieved securely.",
            details: order
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to retrieve order details", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
};

// 🚀 ADDED FOR ADMIN: UPDATE ORDER STATUS / PAYMENT STATUS
export const modifyOrderStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, paymentStatus } = req.body;

        const updatedOrder = await orderService.updateOrderStatus(id, status, paymentStatus);
        
        if (!updatedOrder) {
            res.status(404).json({ message: "Target order reference cannot be located." });
            return;
        }

        res.status(200).json({
            message: "Fulfillment state safely transitioned.",
            details: updatedOrder
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Failed to update order tracking status", error: error.message });
        } else {
            res.status(500).json({ message: "Server Error", error });
        }
    }
}