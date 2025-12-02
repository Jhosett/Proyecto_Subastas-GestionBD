import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./src/routes/products.router"; 
import usersRouter from './src/users';
import analyticsRouter from './src/routes/analytics.router';
import pqrsRouter from './src/routes/pqrs.router';

import bidsRouter from './src/routes/bids.router'; 
import forumRouter from './src/routes/forum.router';
import { startAuctionCloser } from './src/services/auction-closer.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());


// Ruta de prueba
app.get("/api/test", (_req, res) => {
  res.json({ message: "Backend funcionando 🚀" });
});

// Definición de Rutas:
app.use('/api/bids', bidsRouter); // Nueva ruta para pujas
app.use('/api/analytics', analyticsRouter);
app.use('/api/pqrs', pqrsRouter); // Nueva ruta para PQRS
app.use('/api/forum', forumRouter); // Nueva ruta para foro
app.use("/api", usersRouter); // /api/login, /api/register, /api/users/:id
app.use("/api/products", productRoutes); // /api/products

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auction_store")
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    // INICIAR TAREA PROGRAMADA DESPUÉS DE LA CONEXIÓN EXITOSA
    startAuctionCloser(); 
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
  });