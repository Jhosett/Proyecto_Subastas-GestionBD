import { Request, Response } from 'express';
import { Bid } from '../models/bid.model';
import Product from '../models/product.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { sendEmail } from '../utils/email';

// Crear una nueva puja (subasta)
export const createBid = async (req: Request, res: Response): Promise<void> => {
  // Asumimos que compradorId viene del cuerpo o del token de autenticación
  const { productoId, compradorId, valorPuja } = req.body; 

  try {
    const product = await Product.findById(productoId);
    
    // 1. Validación de producto y estado
    if (!product || product.estado === 'finalizado') {
      res.status(404).json({ error: 'Producto no encontrado o subasta finalizada' });
      return;
    }

    // 2. Obtener la puja más alta
    // Aseguramos que productoId se convierta a string si no lo es, para mayor compatibilidad.
    const highestBid = await Bid.findOne({ productoId: productoId }).sort({ valorPuja: -1 });
    const precioMinimo = highestBid ? highestBid.valorPuja : product.precioInicial;
    
    // 3. Validación del valor de la puja
    if (valorPuja <= precioMinimo) {
      res.status(400).json({ error: `La puja debe ser estrictamente superior al valor actual de: ${precioMinimo}` });
      return;
    }
    
    // 4. Obtener emails y datos de los usuarios
    // Usar .toString() para asegurar la compatibilidad de tipos de ID si es necesario
    const buyer = await User.findById(compradorId); 
    const seller = await User.findById(product.vendedorId);
    
    if (!buyer || !seller) {
        res.status(500).json({ error: 'No se encontraron datos de usuario (comprador o vendedor).' });
        return;
    }

    // 5. Crear la nueva puja (Trazabilidad y registro de valor/usuario)
    const newBid = await Bid.create({ productoId, compradorId, valorPuja });

    // 6. Generar Notificaciones y Correos

    // A. Notificación y Correo para el Vendedor: Puja Recibida
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
    
    // B. Notificación y Correo para el Comprador: Puja Realizada
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

    // C. Notificación al anterior mejor postor (si fue superado)
    if (highestBid && highestBid.compradorId.toString() !== compradorId.toString()) {
        const formerBidder = await User.findById(highestBid.compradorId);

        if (formerBidder) {
            // SOLUCIÓN FINAL: Castear formerBidder a 'any' para acceder a _id y luego a string
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

    res.status(201).json(newBid);
    
  } catch (err) {
    console.error('Error al crear puja y/o enviar correo:', err);
    res.status(500).json({ error: 'Error al procesar la puja', details: err });
  }
};