import mongoose, {Schema} from "mongoose";
import ICart from "../interface/ICart";


const cartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity should not be less than 1."],
            default: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true})

export const CartModel = mongoose.model<ICart>("Cart", cartSchema)