import { Request, Response } from "express";
import Product, { IProduct } from "../models/product.model";
import { Bid } from "../models/bid.model";
import { User } from "../models/user.model";
import { Notification } from "../models/notification.model";
import { sendEmail } from "../utils/email";

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

// Realizar puja (bid)
export const placeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: productoId } = req.params;
    const { amount: valorPuja, userId: compradorId } = req.body;

    // Validar que el monto sea válido
    if (!valorPuja || valorPuja <= 0) {
      res.status(400).json({ error: "El monto de la puja debe ser mayor a 0" });
      return;
    }

    if (!compradorId) {
      res.status(400).json({ error: "Usuario no autenticado" });
      return;
    }

    // Obtener el producto
    const product = await Product.findById(productoId);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    // Validar que el producto esté activo
    if (product.estado !== "activo") {
      res.status(400).json({ error: "No se puede pujar en un producto que no está activo" });
      return;
    }

    // Obtener la puja más alta anterior
    const highestBid = await Bid.findOne({ productoId: productoId }).sort({ valorPuja: -1 });
    const precioMinimo = highestBid ? highestBid.valorPuja : product.precioInicial;

    // Validar que la puja sea superior al precio mínimo
    if (valorPuja <= precioMinimo) {
      res.status(400).json({ error: `La puja debe ser estrictamente superior a ${precioMinimo}` });
      return;
    }

    // Crear la nueva puja usando el modelo Bid
    const newBid = await Bid.create({ productoId, compradorId, valorPuja });

    // Generar notificaciones y correos como en bid.controller
    try {
      const buyer = await User.findById(compradorId);
      const seller = await User.findById(product.vendedorId);

      if (buyer && seller) {
        // Notificación y correo para el vendedor
        const subjectVendedor = `¡NUEVA PUJA en tu producto: ${product.nombre}!`;
        const messageVendedor = `El usuario ${buyer.nombre} ha realizado una puja de $${valorPuja} en tu subasta.`;

        await Notification.create({
          userId: product.vendedorId,
          tipo: 'pujaRecibida',
          mensaje: messageVendedor,
          productoId,
        });

        await sendEmail(
          seller.email,
          subjectVendedor,
          messageVendedor,
          `<h2>¡Puja Recibida!</h2><p>Estimado(a) ${seller.nombre},</p><p>${messageVendedor}</p><p>Revisa tu lista de productos para seguir la subasta.</p>`
        );

        // Notificación y correo para el comprador
        const subjectComprador = `Puja de $${valorPuja} realizada exitosamente en ${product.nombre}`;
        const messageComprador = `Has pujado por $${valorPuja} en el producto ${product.nombre}. ¡Mucha suerte en la subasta!`;

        await Notification.create({
          userId: compradorId,
          tipo: 'pujaRealizada',
          mensaje: messageComprador,
          productoId,
        });

        await sendEmail(
          buyer.email,
          subjectComprador,
          messageComprador,
          `<h2>Puja Confirmada</h2><p>Estimado(a) ${buyer.nombre},</p><p>${messageComprador}</p><p>Te notificaremos si eres superado.</p>`
        );

        // Notificar al anterior mejor postor si fue superado
        if (highestBid && highestBid.compradorId.toString() !== compradorId.toString()) {
          const formerBidder = await User.findById(highestBid.compradorId);
          if (formerBidder) {
            const formerBidderIdString: string = (formerBidder as any)._id.toString();
            const subjectSuperado = `ATENCIÓN: Tu puja ha sido superada en ${product.nombre}`;
            const messageSuperado = `Tu puja anterior de $${highestBid.valorPuja} ha sido superada. El valor actual es $${valorPuja}. ¡Vuelve a pujar si deseas ganar!`;

            await Notification.create({
              userId: formerBidderIdString,
              tipo: 'subastaPerdida',
              mensaje: messageSuperado,
              productoId,
            });

            await sendEmail(
              formerBidder.email,
              subjectSuperado,
              messageSuperado,
              `<h2>Puja Superada</h2><p>Lamentamos informarte, ${formerBidder.nombre}, que ${messageSuperado}</p>`
            );
          }
        }
      }
    } catch (notifErr) {
      console.error('Error enviando notificaciones o correos:', notifErr);
    }

    res.status(201).json({
      message: "Puja registrada exitosamente",
      bid: newBid
    });

  } catch (err) {
    console.error("Error al registrar puja:", err);
    res.status(500).json({ error: "Error al registrar la puja", details: err });
  }
};
