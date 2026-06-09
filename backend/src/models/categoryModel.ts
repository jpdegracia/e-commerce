import mongoose, { Schema } from "mongoose";
import ICategory from "../interface/ICategory";

const CategorySchema = new Schema<ICategory>({
    categoryname: {
        type: String,
        required: [true, "Category is Required"],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    }
}, {timestamps: true})

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema)