import mongoose from "mongoose";


interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;

}

interface ICart {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalPrice: number;
}


export default ICart 
