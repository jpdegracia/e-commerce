import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./configs/connectDb";
import cors from 'cors';

//Routes
import userRoutes from "./routes/userRoutes"
import roleRoutes from "./routes/roleRoutes"
import permissionRoutes from "./routes/permissionRoutes"
import authRoutes from "./routes/authRoutes"
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes"
import cartRoutes from "./routes/cartRoutes"
import orderRoutes from "./routes/orderRoutes"

// 1. LOAD ENVIRONMENT VARIABLES
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 2. CONNECT TO DATABASE
connectDB();

// 3. MIDDLEWARE
// This is critical! It allows Express to read incoming JSON data in req.body
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))

// 4. ROUTES
app.use("/users", userRoutes); 
app.use("/roles", roleRoutes);
app.use("/permissions", permissionRoutes);
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

// A quick health-check route just to test if the server is alive via browser
app.get("/", (req, res) => {
    res.send("E-commerce API is running smoothly! 🚀");
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log(`⚡ Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});