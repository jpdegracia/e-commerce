import { Router } from "express";
import { checkPermission, verifyToken } from "../middleware/authMiddleware";
import { getAdminOrderById, getAllOrders, getOrderHistory, getUserOrderById, modifyOrderStatus, placeOrder } from "../controllers/orderController";

const router = Router()

// ==========================================
// 🚀 1. STATIC ROUTES (Must go FIRST!)
// ==========================================
router.post("/checkout", verifyToken, checkPermission("order_create"), placeOrder)
router.get("/history", verifyToken, checkPermission("order_read"), getOrderHistory)

// Admin: to see all incoming orders and list of orders
router.get("/all", verifyToken, checkPermission("order_all"), getAllOrders)


// ==========================================
// 🚀 2. DYNAMIC ROUTES (Must go LAST!)
// ==========================================
// 🚀 Fetch detailed sub-metrics for a single order profile
router.get("/admin/:id", verifyToken, checkPermission("order_all"), getAdminOrderById);

// 🚀 Update shipment states or payment flags
router.put("/admin/:id", verifyToken, checkPermission("order_all"), modifyOrderStatus);

// 👤 Standard user fetching their specific order
router.get("/:id", verifyToken, checkPermission("order_read"), getUserOrderById)

export default router