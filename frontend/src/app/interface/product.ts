
export interface IProduct {
    _id?: string; // Optional, since new products don't have an ID until saved
    productname: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    category: string[] | any; // 'any' handles when it gets populated into an object
}