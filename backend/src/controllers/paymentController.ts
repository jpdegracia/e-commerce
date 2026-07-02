import { Request, Response } from "express";
import { PaymentService } from '../services/paymentServices';

// 🚀 Instantiate the class so the controllers can use it
const paymentService = new PaymentService();

// ==========================================
// 🚀 1. CONTROLLER: Send Link to Angular
// ==========================================
export const createPayMongoCheckout = async (req: Request, res: Response) => {
    try {
        // 🚀 Force TypeScript to treat this as a singular string
        const orderId = req.params.orderId as string;
        
        // Let the Service do the hard work!
        const checkoutUrl = await paymentService.generateCheckoutSession(orderId);

        return res.status(200).json({ checkoutUrl });

    } catch (error: any) {
        const status = error.message.includes("not found") ? 404 : 400;
        return res.status(status).json({ message: error.message });
    }
};

// ==========================================
// 🚀 2. CONTROLLER: Receive Webhook from PayMongo
// ==========================================
export const paymongoWebhook = async (req: Request, res: Response) => {
    try {
        const event = req.body;
        console.log("🔔 PayMongo Webhook Received:", event.data?.attributes?.type);

        // Call the public class method!
        await paymentService.processWebhookEvent(event);

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        return res.status(200).json({ error: "Webhook processing failed." });
    }
};