import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { getProductsBySeller } from "../controllers/product.controller";

const router = Router();

// Rutas Productos
router.get("/", getProducts);        // Listar todos
router.get("/:id", getProductById);  // Obtener uno
router.post("/", createProduct);     // Crear
router.put("/:id", updateProduct);   // Actualizar
router.delete("/:id", deleteProduct); // Eliminar

router.get("/seller/:sellerId", getProductsBySeller); // NUEVA RUTA

export default router;
