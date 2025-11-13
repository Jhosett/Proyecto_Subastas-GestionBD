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

// Listar todas las pujas de un producto
export const getBidsForProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productoId = req.params.id;
    const bids = await Bid.find({ productoId }).sort({ valorPuja: -1 });

    // Enriquecer con datos del usuario (nombre, email)
    const detailed = await Promise.all(bids.map(async (b) => {
      const buyer = await User.findById(b.compradorId).select('nombre email');
      return {
        _id: b._id,
        compradorId: b.compradorId,
        nombre: buyer ? buyer.nombre : undefined,
        email: buyer ? buyer.email : undefined,
        valorPuja: b.valorPuja,
        fechaPuja: b.fechaPuja
      };
    }));

    res.json(detailed);
  } catch (err) {
    console.error('Error al obtener pujas del producto:', err);
    res.status(500).json({ error: 'Error al obtener pujas' });
  }
};

// El vendedor asigna manualmente un ganador y se notifica
export const awardProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productoId = req.params.id;
    const { sellerId, winnerId, paymentMethod, paymentDetails } = req.body;

    const product = await Product.findById(productoId);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Validar que quien llama sea el vendedor del producto
    if (product.vendedorId.toString() !== sellerId) {
      res.status(403).json({ error: 'No autorizado. Solo el vendedor puede asignar ganador.' });
      return;
    }

    if (product.estado === 'finalizado') {
      res.status(400).json({ error: 'La subasta ya fue finalizada' });
      return;
    }

    // Buscar la puja del ganador para confirmar monto
    const winningBid = await Bid.findOne({ productoId, compradorId: winnerId }).sort({ valorPuja: -1 });
    if (!winningBid) {
      res.status(400).json({ error: 'El usuario seleccionado no tiene una puja registrada en este producto' });
      return;
    }

    // Actualizar producto a finalizado y guardar ganador (campo opcional)
    await Product.findByIdAndUpdate(productoId, { estado: 'finalizado' });

    // Crear notificación y correo al ganador
    const winner = await User.findById(winnerId);
    const seller = await User.findById(sellerId);

    const saleMessage = `¡Felicidades! Has sido seleccionado como ganador de ${product.nombre} por $${winningBid.valorPuja}.`;
    if (winner) {
      await Notification.create({ userId: winnerId, tipo: 'subastaGanada', mensaje: saleMessage, productoId });
      // Enviar correo con opciones de pago y detalles
      const paymentInfoHtml = `<p>Has ganado la subasta por <strong>${product.nombre}</strong> por <strong>$${winningBid.valorPuja}</strong>.</p>
        <p>Métodos de pago disponibles:</p>
        <ul>
          <li>Nequi: 3103155486</li>
          <li>Bancolombia - Cuenta corriente: 123456789</li>
          <li>PSE: https://www.pse.com.co (utiliza correo ${winner.email})</li>
        </ul>
        <p>Detalles adicionales: ${paymentDetails || 'Sin detalles'}</p>
      `;
      await sendEmail(winner.email, '🎉 Has ganado la subasta', saleMessage, paymentInfoHtml);
    }

    // Notificar al vendedor (confirmación de venta)
    if (seller) {
      const sellerMsg = `Has asignado el producto ${product.nombre} al usuario ${winner ? winner.nombre : winnerId} por $${winningBid.valorPuja}.`;
      await Notification.create({ userId: sellerId, tipo: 'productoVendido', mensaje: sellerMsg, productoId });
      await sendEmail(seller.email, '✅ Venta asignada', sellerMsg, `<p>${sellerMsg}</p><p>Datos de pago recibidos: ${paymentMethod || 'Indefinido'}</p>`);
    }

    // Notificar a los demás perdedores opcionalmente
    const losersIds = await Bid.find({ productoId, compradorId: { $ne: winnerId } }).distinct('compradorId');
    const losers = await User.find({ _id: { $in: losersIds } });
    for (const loser of losers) {
      const loserMsg = `La subasta de ${product.nombre} ha finalizado. No resultaste ganador.`;
      await Notification.create({ userId: (loser as any)._id.toString(), tipo: 'subastaPerdida', mensaje: loserMsg, productoId });
      try {
        await sendEmail(loser.email, 'Subasta finalizada', loserMsg, `<p>${loserMsg}</p>`);
      } catch (e) {
        console.error('Error enviando correo a perdedor', e);
      }
    }

    res.json({ message: 'Ganador asignado y notificaciones enviadas' });
  } catch (err) {
    console.error('Error en awardProduct:', err);
    res.status(500).json({ error: 'Error al asignar ganador' });
  }
};
