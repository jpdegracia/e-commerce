import mongoose, { Schema } from "mongoose";
import IOrder from "../interface/IOrder";


const orderSchema = new Schema<IOrder>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity should not less than 1"]
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        type: String,
        required: true,
        trim: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Cash on Delivery / C.O.D.", "Card", "Gcash", "Paymaya", "Paypal"],
        default: "Cash on Delivery / C.O.D."
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["Unpaid", "Paid", "Failed to Transact", "Refunded"],
        default: "Unpaid"
    },
    transactionId: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Processing", "Shipped", "On-Delivery", "Delivered", "Cancelled"],
        default: "Pending"
    },
    placedAt: {
        type: Date,
        default: Date.now
    }   
}, { timestamps: true })

export const OrderModel = mongoose.model("Order", orderSchema)