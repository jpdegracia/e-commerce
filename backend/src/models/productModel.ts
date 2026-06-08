import mongoose, { Schema } from "mongoose";
import IProduct from "../interface/IProduct"


const ProductSchema = new Schema<IProduct>({
    productName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    images:[{
        type: String,
    }],
    category: { 
        type: Schema.Types.ObjectId,
        ref: "Category"
    }

})