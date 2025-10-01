import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./src/routes/products.router"; 
import usersRouter from './src/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ IMPORTANTE: Middlewares ANTES de las rutas
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/api/test", (_req, res) => {
  res.json({ message: "Backend funcionando 🚀" });
});


app.use("/api", usersRouter); // /api/login, /api/register, /api/users/:id
app.use("/api/products", productRoutes); // /api/products

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/auction_store")
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
  });