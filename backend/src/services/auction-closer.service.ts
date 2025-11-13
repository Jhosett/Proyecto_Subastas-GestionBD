import * as cron from 'node-cron';
import Product from '../models/product.model';
import { Bid } from '../models/bid.model';
import { Notification } from '../models/notification.model'; 
import { User } from '../models/user.model';
import { sendEmail } from '../utils/email';

// Función para procesar y cerrar subastas expiradas
async function processExpiredAuctions() {
  console.log('Buscando subastas expiradas...');
  
  // Buscar productos activos cuya fechaCierre haya pasado
  const expiredProducts = await Product.find({ 
    estado: 'activo', 
    fechaCierre: { $lte: new Date() } 
  });

  for (const product of expiredProducts) {
    try {
      console.log(`Cerrando subasta para el producto: ${product.nombre}`);

      // Usar product._id.toString() para asegurar el tipo string
      const productIdString: string = (product as any)._id.toString();

      // 1. Encontrar la puja ganadora (la más alta)
      const winningBid = await Bid.findOne({ productoId: productIdString }).sort({ valorPuja: -1 });

      let winner: User | null = null;
      // La variable notificationType no se usa, la comentamos para limpiar el código.
      // let notificationType: INotification['tipo']; 
      let message: string;
      
      // Actualizar el estado del producto, independientemente de si hay ganador.
      await Product.findByIdAndUpdate(productIdString, { estado: 'finalizado' });
      
      if (winningBid) {
        // 2. Si hay ganador
        winner = await User.findById(winningBid.compradorId);
        const seller = await User.findById(product.vendedorId);

        // 3. Notificación y Correo al GANADOR
        if (winner) {
          // Casteo a 'any' para el _id
          const winnerIdString: string = (winner as any)._id.toString(); 
          message = `¡Felicidades! Has ganado la subasta por ${product.nombre} con una puja de $${winningBid.valorPuja}.`;
          await Notification.create({ 
            userId: winnerIdString, 
            tipo: 'subastaGanada', 
            mensaje: message, 
            productoId: productIdString 
          });
          await sendEmail(winner.email, '🎉 ¡Subasta Ganada!', message, `<h2>¡Eres el ganador!</h2><p>${message}</p>`);
        }
        
        // 4. Notificación y Correo al VENDEDOR
        if (seller && winner) {
          // Casteo a 'any' para el _id
          const sellerIdString: string = (seller as any)._id.toString();
          message = `Tu producto ${product.nombre} ha sido vendido por $${winningBid.valorPuja} al usuario ${winner!.nombre}.`;
          await Notification.create({ 
            userId: sellerIdString, 
            tipo: 'productoVendido', 
            mensaje: message, 
            productoId: productIdString 
          });
          await sendEmail(seller.email, '💰 Producto Vendido', message, `<h2>¡Venta Exitosa!</h2><p>${message}</p>`);
        }

        // 5. Notificar a los PERDEDORES (opcional, pero recomendado)
        // Usamos productIdString para la consulta
        const losersBids = await Bid.find({ 
            productoId: productIdString, 
            compradorId: { $ne: winningBid.compradorId } 
        }).distinct('compradorId'); // Obtener IDs únicos de perdedores
        
        const losers = await User.find({ _id: { $in: losersBids } });

        for (const loser of losers) {
            // Casteo a 'any' para el _id
            const loserIdString: string = (loser as any)._id.toString();
            message = `La subasta de ${product.nombre} ha finalizado. Desafortunadamente no fuiste el ganador.`;
            await Notification.create({ 
              userId: loserIdString, 
              tipo: 'subastaPerdida', 
              mensaje: message, 
              productoId: productIdString 
            });
            await sendEmail(loser.email, 'Subasta Finalizada', message, `<h2>Subasta Finalizada</h2><p>${message}</p>`);
        }

      } else {
        // Si no hay pujas
        console.log(`Subasta ${product.nombre} finalizada sin pujas.`);
      }
    } catch (error) {
      console.error(`Error al procesar subasta ${product.nombre}:`, error);
    }
  }
}

// Configurar y exportar la tarea programada (ej. cada 5 minutos)
export const startAuctionCloser = () => {
  // Se ejecuta cada 5 minutos
  cron.schedule('*/5 * * * *', processExpiredAuctions);
  console.log('Tarea programada para cerrar subastas iniciada (cada 5 minutos).');
};