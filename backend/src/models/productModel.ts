import mongoose, { Schema } from "mongoose";
import IProduct from "../interface/IProduct"


const ProductSchema = new Schema<IProduct>({
    productName: {
        type: String,
        required: [true, "Product name is Required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is Required"],
        min: [0, "Price cannot be a negative value."]
    },
    stock: {
        type: Number,
        required: [true, "Stock is Required"],
        min: [0, "Stock cannot be less than 0."],
        default: 0
    },
    images:[{
        type: String,
        trim: true,
    }],
    category: { 
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "A product must belong to a category."]
    }

}, {timestamps: true})

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema)
