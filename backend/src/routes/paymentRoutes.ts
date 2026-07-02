import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createPayMongoCheckout, paymongoWebhook } from "../controllers/paymentController";


const router = Router();

// ==========================================
// 👤 USER ROUTE: Generate Checkout Link
// ==========================================
// We use verifyToken here because only logged-in users should be able 
// to create payment links for their own orders.
router.post("/checkout/:orderId", verifyToken, createPayMongoCheckout);

// ==========================================
// 🤖 SYSTEM ROUTE: PayMongo Webhook
// ==========================================
// 🚨 CRITICAL: NO verifyToken here! 
// PayMongo's automated servers are the ones hitting this route, 
// and they do not have your user's JWT login token.
router.post("/webhook", paymongoWebhook);

export default router;