// src/app/interface/order.ts

export interface IPopulatedUser {
  _id: string;
  fullname: string;
  email: string;
}

export interface IPopulatedProduct {
  _id: string;
  productname: string;
  image?: string;
  price?: number;
}

export interface IFrontendOrderItem {
  product: IPopulatedProduct; // 🚀 Populated by Mongoose
  price: number;
  quantity: number;
  _id?: string;
}

export interface IOrderResponse {
  _id: string;
  user: IPopulatedUser; // 🚀 Populated by Mongoose
  items: IFrontendOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: "Cash on Delivery / C.O.D." | "Card" | "Gcash" | "Paymaya" | "Paypal";
  paymentStatus: "Unpaid" | "Paid" | "Failed to Transact" | "Refunded";
  transactionId?: string;
  status: "Pending" | "Processing" | "Shipped" | "On-Delivery" | "Delivered" | "Cancelled";
  createdAt: string; // Mongoose timestamps translate to strings over JSON HTTP
  updatedAt: string;
}