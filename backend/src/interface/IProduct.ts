import mongoose from "mongoose";

interface IProduct {
    productName: string,
    description: string,
    price: number,
    stock: number,
    images: string[],
    category: mongoose.Types.ObjectId

}

export default IProduct;