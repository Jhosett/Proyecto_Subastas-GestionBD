

import * as nodemailer from 'nodemailer';
import 'dotenv/config'; 

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || 'Sistema de Subastas'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Correo de notificación enviado a ${to}: ${subject}`);
  } catch (error) {
    console.error(`Error al enviar correo de notificación a ${to}:`, error);
    
  }
};