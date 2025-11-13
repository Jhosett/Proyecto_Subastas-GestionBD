require('dotenv').config();
const nodemailer = require('nodemailer');

const host = process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT || '587');
const secure = process.env.EMAIL_PORT === '465';
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const fromName = process.env.EMAIL_SENDER_NAME || 'Sistema de Subastas';
const to = process.env.TEST_EMAIL || process.env.EMAIL_USER;

async function run() {
  if (!host || !user || !pass) {
    console.error('Faltan credenciales SMTP en .env (EMAIL_HOST/EMAIL_USER/EMAIL_PASS)');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject: 'Prueba de correo - Sistema de Subastas',
      text: 'Este es un correo de prueba enviado desde el entorno de desarrollo para verificar la configuración SMTP.',
      html: '<p>Este es un <strong>correo de prueba</strong> enviado desde el entorno de desarrollo para verificar la configuración SMTP.</p>'
    });
    console.log('Correo enviado, respuesta del servidor:', info);
    process.exit(0);
  } catch (err) {
    console.error('Error enviando correo de prueba:', err);
    process.exit(1);
  }
}

run();
