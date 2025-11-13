require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_store';

async function run(productId) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB para cierre de subasta');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const Bid = mongoose.model('Bid', new mongoose.Schema({}, { strict: false }), 'bids');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }), 'notifications');

    const product = await Product.findById(productId).lean();
    if (!product) {
      console.error('Producto no encontrado:', productId);
      process.exit(1);
    }

    console.log('Procesando cierre de subasta para:', product.nombre);

    // Encontrar la puja ganadora
    const winningBid = await Bid.find({ productoId: productId }).sort({ valorPuja: -1 }).limit(1).lean();
    const winnerBid = (winningBid && winningBid.length) ? winningBid[0] : null;

    // Actualizar estado del producto a finalizado
    await Product.findByIdAndUpdate(productId, { estado: 'finalizado' });
    console.log('Producto marcado como finalizado');

    // Configurar transporter para enviar correos
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    if (winnerBid) {
      const winner = await User.findById(winnerBid.compradorId).lean();
      const seller = await User.findById(product.vendedorId).lean();

      // Notificar ganador
      if (winner) {
        const msg = `¡Felicidades! Has ganado la subasta por ${product.nombre} con una puja de $${winnerBid.valorPuja}.`;
        await Notification.create({ userId: winner._id.toString(), tipo: 'subastaGanada', mensaje: msg, productoId: productId, leida: false });
        await transporter.sendMail({ from: `"${process.env.EMAIL_SENDER_NAME || 'Sistema de Subastas'}" <${process.env.EMAIL_USER}>`, to: winner.email, subject: '🎉 ¡Subasta Ganada!', text: msg, html: `<p>${msg}</p><p>Por favor contacta al vendedor para coordinar el pago y la entrega.</p>` });
        console.log('Correo enviado al ganador:', winner.email);
      }

      // Notificar vendedor
      if (seller) {
        const msgSeller = `Tu producto ${product.nombre} ha sido vendido por $${winnerBid.valorPuja} al usuario ${winner ? winner.nombre : winnerBid.compradorId}.`;
        await Notification.create({ userId: seller._id.toString(), tipo: 'productoVendido', mensaje: msgSeller, productoId: productId, leida: false });
        await transporter.sendMail({ from: `"${process.env.EMAIL_SENDER_NAME || 'Sistema de Subastas'}" <${process.env.EMAIL_USER}>`, to: seller.email, subject: '💰 Producto Vendido', text: msgSeller, html: `<p>${msgSeller}</p><p>Por favor contacta al comprador para coordinar el pago y la entrega.</p>` });
        console.log('Correo enviado al vendedor:', seller.email);
      }

      // Notificar perdedores
      const losersIds = await Bid.find({ productoId: productId, compradorId: { $ne: winnerBid.compradorId } }).distinct('compradorId');
      if (losersIds && losersIds.length) {
        const losers = await User.find({ _id: { $in: losersIds } }).lean();
        for (const loser of losers) {
          const msgLose = `La subasta de ${product.nombre} ha finalizado. Desafortunadamente no fuiste el ganador.`;
          await Notification.create({ userId: loser._id.toString(), tipo: 'subastaPerdida', mensaje: msgLose, productoId: productId, leida: false });
          try {
            await transporter.sendMail({ from: `"${process.env.EMAIL_SENDER_NAME || 'Sistema de Subastas'}" <${process.env.EMAIL_USER}>`, to: loser.email, subject: 'Subasta Finalizada', text: msgLose, html: `<p>${msgLose}</p>` });
            console.log('Correo enviado a perdedor:', loser.email);
          } catch (err) {
            console.error('Error enviando correo a perdedor', loser.email, err);
          }
        }
      }

    } else {
      console.log('No hubo pujas en esta subasta. No se enviarán correos de ganador/vendedor.');
    }

    console.log('Cierre de subasta completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en cierre de subasta:', err);
    process.exit(1);
  }
}

const productIdArg = process.argv[2] || '69152aa65b12647aa134e168';
run(productIdArg);
