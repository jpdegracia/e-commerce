import mongoose from "mongoose";

interface IOrderItem {
    product: mongoose.Types.ObjectId,
    price: number,
    quantity: number
}

interface IOrder {
    user: mongoose.Types.ObjectId,
    items: IOrderItem[],
    totalAmount: number,
    shippingAddress: string,
    paymentMethod: "Cash on Delivery / C.O.D." | "Card" | "Gcash" | "Paymaya" | "Paypal",
    paymentStatus: "Unpaid" | "Paid" | "Failed to Transact" | "Refunded",
    transactionId?: string,
    status: "Pending" | "Processing" | "Shipped" | "On-Delivery" | "Delivered"| "Cancelled",
    placedAt: Date;
}

export default IOrder