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
        const products = await ProductModel.find();
        return products;
    }

    public async getProductByID(id: string) {
        const product = await ProductModel.findById(id);
        return product;
    }

    public async updateProduct(id: string, updateData: Partial<IProduct>) {
        const product = await ProductModel.findByIdAndUpdate(id, updateData, {new: true, runValidators: true});
        return product;
    }

    public async deleteProduct(id: string) {
        const product = await ProductModel.findByIdAndDelete(id)
        return product;
    }
}