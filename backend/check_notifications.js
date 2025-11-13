const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_store';

const notificationSchema = new mongoose.Schema({}, { strict: false });
const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a Mongo para verificar notificaciones');
    const notes = await Notification.find().sort({ _id: -1 }).limit(20).lean();
    console.log('Últimas notificaciones:', JSON.stringify(notes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error leyendo notificaciones:', err);
    process.exit(1);
  }
}

run();
