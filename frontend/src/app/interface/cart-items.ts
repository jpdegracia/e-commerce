// src/app/interface/cart-item.ts

export interface IPopulatedCartProduct {
  _id: string;
  productname: string;
  images?: string[]; // 🚀 Changed to an array to support multiple images!
  price: number;
  stock: number;
}

export interface CartItem {
  product: IPopulatedCartProduct; // 🚀 Nests the product data exactly like Mongoose populates it
  price: number;
  quantity: number;
  _id?: string;
}