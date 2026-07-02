import { OrderModel as Order } from '../models/orderModel';


export class PaymentService {
    
    // 🚀 1. SERVICE: Generate Checkout Link
    public async generateCheckoutSession(orderId: string) {
        // 1. Find order
        const order = await Order.findById(orderId).populate('user', 'fullname email').populate('items.product');

        if (!order) throw new Error("Order not found");
        if (order.paymentStatus === "Paid") throw new Error("Order is already paid");

        // 2. Format for PayMongo
        const lineItems = order.items.map((item: any) => ({
            name: item.product.productname,
            amount: Math.round(item.price * 100), 
            currency: "PHP",
            quantity: item.quantity
        }));

        const secretKey = process.env.PAYMONGO_SECRET_KEY;
        const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

        // 3. Talk to PayMongo
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${encodedKey}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: lineItems,
                        payment_method_types: ['gcash', 'paymaya', 'card'],
                        success_url: `http://localhost:4200/orders/${orderId}?payment=success`,
                        cancel_url: `http://localhost:4200/orders/${orderId}?payment=cancelled`,
                        description: `Payment for Order #${orderId}`
                    }
                }
            })
        });

        const paymongoData = await response.json();

        if (!response.ok) {
            // 🚀 ADD THESE DIAGNOSTIC LOGS:
            console.log("=========================================");
            console.log("❌ PAYMONGO API ERROR DETECTED (400)");
            console.log("Status Text:", response.statusText);
            console.log("Full Error Payload:", JSON.stringify(paymongoData, null, 2));
            console.log("=========================================");
            
            throw new Error("Failed to communicate with payment gateway");
            console.error("PayMongo API Error:", paymongoData);
            throw new Error("Failed to communicate with payment gateway");
        }

        return paymongoData.data.attributes.checkout_url;
    }

    // 🚀 2. SERVICE: Process the Webhook Event
    public async processWebhookEvent(event: any) {
        if (event.data?.attributes?.type !== "checkout_session.payment.paid") return;

        const checkoutData = event.data.attributes.data.attributes;
        const description = checkoutData.description || "";
        const orderIdMatch = description.match(/Order #([a-zA-Z0-9]+)/);
        
        if (orderIdMatch && orderIdMatch[1]) {
            const orderId = orderIdMatch[1];
            const order = await Order.findById(orderId);
            
            if (order && order.paymentStatus !== "Paid") {
                order.paymentStatus = "Paid";
                order.transactionId = checkoutData.payments?.[0]?.id || "PAYMONGO_TXN";
                await order.save();
                console.log(`✅ Order ${orderId} successfully marked as PAID via Webhook!`);
            }
        }
    }
}