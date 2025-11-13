import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  placeBid,
  getBidsForProduct,
  awardProduct
} from "../controllers/product.controller";
import { getProductsBySeller } from "../controllers/product.controller";

const router = Router();

// Rutas Productos
router.get("/", getProducts);       
router.get("/:id", getProductById); 
router.post("/", createProduct);     
router.put("/:id", updateProduct);  
router.delete("/:id", deleteProduct);
router.post("/:id/bid", placeBid);

// Listar pujas y asignar ganador (seller)
router.get("/:id/bids", getBidsForProduct);
router.post("/:id/award", awardProduct);

router.get("/seller/:sellerId", getProductsBySeller); 

export default router;
