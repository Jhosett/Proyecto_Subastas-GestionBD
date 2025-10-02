import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db";
import productRoutes from "./routes/products.router";
import userRoutes from "./users"; 

dotenv.config();

const app = express();


app.use(cors()); 
app.use(express.json());

connectDB();

// Rutas
app.use("/api/products", productRoutes);
app.use("/api", userRoutes); 

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});