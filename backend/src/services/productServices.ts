import IProduct from "../interface/IProduct";
import { ProductModel } from "../models/productModel";


class ProductService {

    public async createProduct(productData: IProduct) {
        const existingProduct = await ProductModel.findOne({ productname: productData.productname });
        if (existingProduct) {
            throw new Error(`The product '${productData.productname}'already exist`);
        }
        const newProduct = new ProductModel(productData);
        await newProduct.save();
        return newProduct;
    }

    public async getAllProducts() {
        const products = await ProductModel.find()
        .populate("category")
        return products;
    }

    public async getProductByID(id: string) {
        const product = await ProductModel.findById(id)
        .populate("category")
        if (!product) {
            throw new Error("Product with this ID not found")
        }
        return product;
    }

    public async updateProduct(id: string, updateData: Partial<IProduct>) {
        const product = await ProductModel.findByIdAndUpdate(id, updateData, {new: true, runValidators: true});
        if (!product) {
            throw new Error("Product not found or update failed.")
        }
        return product;
    }

    public async deleteProduct(id: string) {
        const product = await ProductModel.findByIdAndDelete(id)
        if (!product) {
            throw new Error("Product not found or already deleted.");
        }
        return { message: "Product deleted successfully." };
    }
}

export const productServices = new ProductService();