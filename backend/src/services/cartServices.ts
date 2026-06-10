import mongoose from "mongoose";
import ICart from "../interface/ICart";
import IProduct from "../interface/IProduct";
import { ProductModel } from "../models/productModel";
import { CartModel } from "../models/cartModel";


class CartService {

    private async calculateTotalPrice(items: Array<{ product: mongoose.Types.ObjectId; quantity: number}>): Promise<number> {

        const finalTotal = await items.reduce(async (totalPromise, items) => {
            const currentTotal = await totalPromise;
            const product = await ProductModel.findById(items.product);
            if (product) {
                return currentTotal + (product.price * items.quantity)
            }
            return currentTotal;
        }, Promise.resolve(0));
        return Number(finalTotal.toFixed(2));
    }

    public async addItemToCart(userId: string, productId: string, quantity: number) {
        const product = await ProductModel.findById(productId);

        //validation of finding productId
        if (!product) {
            throw new Error("Product not found")
        }

        //validation for stock
        if(product.stock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.stock} items left`)
        }

        let cart = await CartModel.findOne({ user: userId })

        //validation if users cart is empty
        if (!cart) {
            cart = new CartModel({
                user: userId,
                items: [{ product: productId, quantity }],
                totalPrice: 0
            });

        //validation if users has existing cart    
        } else {
            const productObjectId = new mongoose.Types.ObjectId(productId);
            const itemIndex = cart.items.findIndex(items => items.product.toString() === productId)

            //add up the quantity
            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                
                if (product.stock < newQuantity) {
                    throw new Error(`Cannot add more. Total cart quantity exceeds available store stock (${product.stock}).`);
                }

                cart.items[itemIndex].quantity = newQuantity;   
            } else {
                cart.items.push({ product: productObjectId, quantity })
            }
            
        }
        // Run the price math helper before committing to MongoDB
        cart.totalPrice = await this.calculateTotalPrice(cart.items as any);

        await cart.save();
        return await cart.populate("items.product");
    }
}