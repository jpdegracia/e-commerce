import mongoose from "mongoose";
import { CartModel } from "../models/cartModel";
import { ProductModel } from "../models/productModel";
import { OrderModel } from "../models/orderModel";


class OrderService {

    //real application()
    // public async checkoutCart(userId: string, shippingAddress: string, paymentMethod: string) {
        
    //     //fetch user live cart and its populated products
    //     const cart = await CartModel.findOne({ user: userId }).populate("items.products");
    //     if (!cart || cart.items.length === 0) {
    //         throw new Error("Your Shopping Cart is Empty.")
    //     }

    //     //validate the stocks of the item
    //     for (const item of cart.items) {
    //         const product = item.product as any;
    //         if (product.stock < item.quantity) {
    //             throw new Error(`Stock Alert: ${product.productname} only has ${product.quantity} units left`)
    //         }
    //     }

    //     //deduct stock from the product collection
    //     for (const item of cart.items) {
    //         await ProductModel.findByIdAndUpdate(
    //             item.product._id, 
    //             {$inc: {stock: -item.quantity}}  
    //         )
    //     }

    //     //create snapshotting of ordered products
    //     const orderItems = cart.items.map((item: any) => ({
    //         product: item.product._id,
    //         price: item.product.price,
    //         quantity: item.quantity
    //     }));

    //     //instantiate save the order
    //     const newOrder = new OrderModel({
    //         user: new mongoose.Types.ObjectId(userId),
    //         items: orderItems,
    //         totalAmount: cart.totalPrice,
    //         shippingAddress,
    //         paymentMethod,
    //         // If payment method is Card/Gcash/Paymaya, set it to "Unpaid" initially until gateway webhooks approve it
    //         paymentStatus: paymentMethod === "Cash on Delivery / C.O.D." ? "Unpaid" : "Unpaid", 
    //         status: "Pending"
    //     });

    //     await newOrder.save();

    //     //if paid wipe the cart clean and reset
    //     await CartModel.findOneAndUpdate(
    //         { user: userId },
    //         { $set: { items: [], totalPrice: 0 } }
    //     );

    //     return newOrder;
    // }

    //dummy application of transaction
    public async checkoutCart(userId: string, shippingAddress: string, paymentMethod: string) {
        // 1. Fetch the user's live cart
        const cart = await CartModel.findOne({ user: userId }).populate("items.product");
        
        if (!cart || cart.items.length === 0) {
            throw new Error("Your shopping cart is empty.");
        }

        // 2. Validate Inventory Stock Levels
        for (const item of cart.items) {
            const product = item.product as any;
            if (product.stock < item.quantity) {
                throw new Error(`Stock alert: '${product.productname}' only has ${product.stock} units left.`);
            }
        }

        // 3. Deduct Stock Counts
        for (const item of cart.items) {
            await ProductModel.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // 4. Create the Frozen Order Snapshot
        const orderItems = cart.items.map((item: any) => ({
            product: item.product._id,
            price: item.product.price,
            quantity: item.quantity
        }));

        // 🌟 THE DUMMY PAYMENT SIMULATOR 🌟
        let finalPaymentStatus = "Unpaid";
        let generatedTransactionId = undefined; // Stays empty for C.O.D.
        let initialOrderStatus = "Pending";

        if (paymentMethod !== "Cash on Delivery / C.O.D.") {
            // If they picked GCash, PayMaya, Card, or PayPal, we fake a successful transaction!
            finalPaymentStatus = "Paid";
            initialOrderStatus = "Processing"; // Automatically move to processing since it's paid
            
            // Generate a random, unique fake ID (e.g., "mock_txn_1718234567_abc12")
            const randomString = Math.random().toString(36).substring(2, 8);
            generatedTransactionId = `mock_txn_${Date.now()}_${randomString}`;
        }

        // 5. Instantiate and Save the Order
        const newOrder = new OrderModel({
            user: new mongoose.Types.ObjectId(userId),
            items: orderItems,
            totalAmount: cart.totalPrice,
            shippingAddress,
            paymentMethod,
            paymentStatus: finalPaymentStatus,       // 💉 Injected from simulator
            transactionId: generatedTransactionId,   // 💉 Injected from simulator
            status: initialOrderStatus               // 💉 Injected from simulator
        });

        await newOrder.save();

        // 6. Wipe the Cart Clean
        await CartModel.findOneAndUpdate(
            { user: userId },
            { $set: { items: [], totalPrice: 0 } }
        );

        return newOrder;
    }

    public async getUserOrderHistory(userId: string) {
        const orders = await OrderModel.find({ user: userId })
        .sort({ createdAt: -1 }) //sort decreasing order (latest on top)
        .populate("items.products", "productname image stock")

        return orders;
    }

    public async getAllStoreOrders() {
        const allOrders = await OrderModel.find({})
            .sort({ createdAt: -1 })
            .populate("user", "name email") // Fetch who bought it
            .populate("items.product", "productname image"); 
            
        return allOrders;
    }

}

export const orderService = new OrderService();