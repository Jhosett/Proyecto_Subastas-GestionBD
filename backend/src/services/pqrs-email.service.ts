import { sendEmail } from '../utils/email';
import { User } from '../models/user.model';
import { IPQRS } from '../models/pqrs.model';
import Product from '../models/product.model';

export class PQRSEmailService {
  static async sendPQRSNotification(pqrs: IPQRS) {
    try {
      // Get user data for sender info (if not anonymous)
      const sender = await User.findById(pqrs.userId);
      if (!sender) {
        console.error('Sender not found for PQRS:', pqrs._id);
        return;
      }

      // Determine recipient email
      let recipientEmail = process.env.ADMIN_EMAIL || 'admin@bidup.com';

      // If PQRS is related to a product, send to the seller
      if (pqrs.productId) {
        const product = await Product.findById(pqrs.productId);
        if (product) {
          const seller = await User.findById(product.vendedorId);
          if (seller) {
            recipientEmail = seller.email;
          }
        }
      }
      // If PQRS is related to a specific user, send to them instead
      else if (pqrs.relatedUserId) {
        const relatedUser = await User.findById(pqrs.relatedUserId);
        if (relatedUser) {
          recipientEmail = relatedUser.email;
        }
      }

      // Prepare email content
      const typeLabels = {
        peticion: 'Petición',
        queja: 'Queja',
        reclamo: 'Reclamo',
        sugerencia: 'Sugerencia'
      };

      const subject = `Nueva ${typeLabels[pqrs.type]}: ${pqrs.subject}`;
      
      // Anonymous handling
      const senderInfo = pqrs.isAnonymous 
        ? 'Usuario Anónimo' 
        : `${sender.nombre} (${sender.email})`;

      const text = `
Nueva ${typeLabels[pqrs.type]} recibida

Tipo: ${typeLabels[pqrs.type]}
Asunto: ${pqrs.subject}
De: ${senderInfo}
Fecha: ${new Date(pqrs.createdAt).toLocaleString('es-ES')}

Descripción:
${pqrs.description}

${pqrs.productId ? `Producto relacionado: ${pqrs.productId}` : ''}
${pqrs.relatedUserId ? `Usuario relacionado: ${pqrs.relatedUserId}` : ''}

---
Sistema PQRS - BidUp
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nueva ${typeLabels[pqrs.type]}</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-top: 0;">${pqrs.subject}</h2>
              
              <div style="margin: 15px 0;">
                <strong>Tipo:</strong> ${typeLabels[pqrs.type]}<br>
                <strong>De:</strong> ${senderInfo}<br>
                <strong>Fecha:</strong> ${new Date(pqrs.createdAt).toLocaleString('es-ES')}
              </div>
              
              <div style="margin: 20px 0;">
                <strong>Descripción:</strong>
                <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${pqrs.description}
                </p>
              </div>
              
              ${pqrs.productId ? `<p><strong>Producto relacionado:</strong> ${pqrs.productId}</p>` : ''}
              ${pqrs.relatedUserId ? `<p><strong>Usuario relacionado:</strong> ${pqrs.relatedUserId}</p>` : ''}
            </div>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">Sistema PQRS - BidUp</p>
          </div>
        </div>
      `;

      await sendEmail(recipientEmail, subject, text, html);
      console.log(`PQRS notification sent to ${recipientEmail}`);

    } catch (error) {
      console.error('Error sending PQRS notification:', error);
    }
  }

  static async sendPQRSResponse(pqrs: IPQRS, response: string) {
    try {
      // Don't send response email if PQRS is anonymous
      if (pqrs.isAnonymous) {
        console.log('Skipping response email for anonymous PQRS:', pqrs._id);
        return;
      }

      const user = await User.findById(pqrs.userId);
      if (!user) {
        console.error('User not found for PQRS response:', pqrs._id);
        return;
      }

      const typeLabels = {
        peticion: 'Petición',
        queja: 'Queja',
        reclamo: 'Reclamo',
        sugerencia: 'Sugerencia'
      };

      const subject = `Respuesta a tu ${typeLabels[pqrs.type]}: ${pqrs.subject}`;
      
      const text = `
Hola ${user.nombre},

Hemos respondido a tu ${typeLabels[pqrs.type]} enviada el ${new Date(pqrs.createdAt).toLocaleString('es-ES')}.

Asunto original: ${pqrs.subject}

Nuestra respuesta:
${response}

Gracias por contactarnos.

---
Equipo BidUp
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Respuesta a tu ${typeLabels[pqrs.type]}</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p>Hola <strong>${user.nombre}</strong>,</p>
              
              <p>Hemos respondido a tu ${typeLabels[pqrs.type]} enviada el ${new Date(pqrs.createdAt).toLocaleString('es-ES')}.</p>
              
              <div style="margin: 20px 0;">
                <strong>Asunto original:</strong> ${pqrs.subject}
              </div>
              
              <div style="margin: 20px 0;">
                <strong>Nuestra respuesta:</strong>
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0;">
                  ${response}
                </div>
              </div>
              
              <p>Gracias por contactarnos.</p>
            </div>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">Equipo BidUp</p>
          </div>
        </div>
      `;

      await sendEmail(user.email, subject, text, html);
      console.log(`PQRS response sent to ${user.email}`);

    } catch (error) {
      console.error('Error sending PQRS response:', error);
    }
  }
}