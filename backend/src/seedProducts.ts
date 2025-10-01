import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/product.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/auction_store";

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar productos antiguos
    await Product.deleteMany({});
    console.log("🗑️ Productos antiguos eliminados");

    // Productos de ejemplo
    const products = [
      {
        nombre: "Laptop Gamer ASUS",
        descripcion: "Laptop potente para gaming con tarjeta gráfica dedicada",
        precioInicial: 3500,
        imagenUrl: "https://via.placeholder.com/300x200.png?text=Laptop+Gamer",
        categoria: "Tecnología",
        vendedorId: "user123",
        fechaCierre: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días después
      },
      {
        nombre: "Bicicleta de montaña",
        descripcion: "Bicicleta en excelente estado, poco uso",
        precioInicial: 800,
        imagenUrl: "https://via.placeholder.com/300x200.png?text=Bicicleta",
        categoria: "Deportes",
        vendedorId: "user456",
        fechaCierre: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días después
      },
      {
        nombre: "Smartphone Samsung Galaxy",
        descripcion: "Celular de última generación, 128GB, 8GB RAM",
        precioInicial: 1200,
        imagenUrl: "https://via.placeholder.com/300x200.png?text=Samsung+Galaxy",
        categoria: "Tecnología",
        vendedorId: "user789",
        fechaCierre: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días después
      },
    ];

    await Product.insertMany(products);
    console.log("🎉 Productos insertados correctamente");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error al sembrar productos:", err);
    process.exit(1);
  }
};

seedProducts();
