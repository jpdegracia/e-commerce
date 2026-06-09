import ICategory from "../interface/ICategory";
import { CategoryModel } from "../models/categoryModel";


class CategoryService {

    // Helper method to convert text into a URL-safe slug string
    private generateSlug(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/&/g, '-and-')         // Replace '&' with 'and'
            .replace(/[^a-z0-9\s-]/g, '')   // Remove all non-alphanumeric characters except spaces and dashes
            .replace(/[\s-]+/g, '-')        // Replace spaces and multiple dashes with a single dash
            .replace(/^-+|-+$/g, '');       // Trim dashes from start and end
    }

    public async registerCategory(categoryData: ICategory) {
        const existingCategory = await CategoryModel.findOne({ categoryname: categoryData.categoryname });
        if (existingCategory) {
            throw new Error(`The category '${categoryData.categoryname}' already exists`);
        }

        const slug = this.generateSlug(categoryData.categoryname);

        const newCategory = new CategoryModel({
            ...categoryData,
            slug
        });
        await newCategory.save();
        return newCategory;
    }

    public async getAllCategory() {
        const getAllCategory = await CategoryModel.find();
        return getAllCategory;
    }
    
    public async getCategoryByID(id: string) {
        const getCategoryByID = await CategoryModel.findById(id);
        if(!getCategoryByID) {
            throw new Error("Category not found.")
        }
        return getCategoryByID;
    }

    public async updateCategory(id: string, updateData: Partial<ICategory>) {
        const dataToUpdate = { ...updateData };
        
        if (dataToUpdate.categoryname) {
            dataToUpdate.slug = this.generateSlug(dataToUpdate.categoryname);
        }

        const updateCategory = await CategoryModel.findByIdAndUpdate(id, updateData, {new: true, dataToUpdate, runValidators: true});

        if (!updateCategory) {
            throw new Error("Category not found or update failed.");
        }

        return updateCategory;
    }

    public async deleteCategory(id: string) {
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            throw new Error("Category not found or already deleted.");
        }
        return { message: `Category '${deletedCategory.categoryname}' deleted successfully.` };

    }
}

export const categoryServices = new CategoryService();
