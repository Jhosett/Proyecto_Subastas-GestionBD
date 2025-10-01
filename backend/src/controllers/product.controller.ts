import { Request, Response } from "express";
import Product, { IProduct } from "../models/product.model";

// Crear producto
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body as IProduct);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: "Error al crear producto", details: err });
  }
};

// Obtener productos por vendedor
export const getProductsBySeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = req.params.sellerId;
    console.log("Buscando productos del vendedor:", sellerId);
    const products = await Product.find({ vendedorId: sellerId }).sort({ fechaCreacion: -1 });
    console.log("Productos encontrados:", products);
    res.json(products);
  } catch (err) {
    console.error("Error interno al obtener productos por vendedor:", err);
    res.status(500).json({ error: "Error al obtener productos del vendedor", details: err });
  }
};

// Listar todos
export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().sort({ fechaCreacion: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos", details: err });
  }
};

// Obtener uno por id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error("Error al buscar producto:", err);
    res.status(500).json({ error: "Error al buscar producto", details: err });
  }
};

// Actualizar
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar", details: err });
  }
};

// Eliminar
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar", details: err });
  }
};
