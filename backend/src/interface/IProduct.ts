import mongoose from "mongoose";

interface IProduct {
    productname: string,
    description: string,
    price: number,
    stock: number,
    images: string[],
    category: mongoose.Types.ObjectId

}

export default IProduct;