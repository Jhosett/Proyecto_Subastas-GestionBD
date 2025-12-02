import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db";
import productRoutes from "./routes/products.router";
import userRoutes from "./users";
import analyticsRoutes from "./routes/analytics.router";
import pqrsRoutes from "./routes/pqrs.router";

dotenv.config();

const app = express();


app.use(cors()); 
app.use(express.json());

connectDB();

// Rutas
app.use("/api/products", productRoutes);
app.use("/api", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/pqrs", pqrsRoutes); 

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});