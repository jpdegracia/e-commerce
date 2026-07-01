import { Router } from "express";
import { checkPermission, verifyToken } from "../middleware/authMiddleware";
import { getAdminOrderById, getAllOrders, getOrderHistory, modifyOrderStatus, placeOrder } from "../controllers/orderController";



const router = Router()

router.post("/checkout", verifyToken, checkPermission("order_create"), placeOrder)
router.get("/history", verifyToken, checkPermission("order_read"), getOrderHistory)

// Admin: to see all incoming orders and list of orders
router.get("/all", verifyToken, checkPermission("order_all"), getAllOrders)

// 🚀 ADDED: Fetch detailed sub-metrics for a single order profile
router.get("/admin/:id", verifyToken, checkPermission("order_all"), getAdminOrderById);

// 🚀 ADDED: Update shipment states or payment flags
router.put("/admin/:id", verifyToken, checkPermission("order_all"), modifyOrderStatus);

export default router