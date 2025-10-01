import mongoose, { Document, Schema } from 'mongoose';

//Interfaz de mongoose que representa un documento de mongo
//Define los atributos y valores del usuario
export interface User extends Document {
  nombre: string;
  tipoDocumento: 'ti' | 'cc' | 'ce';
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  email: string;
  password: string;
  esVendedor: boolean;
  datosVendedor?: {
    tipoActividad: 'individual' | 'empresa';
    nombreEmpresa?: string;
    descripcionEmpresa?: string;
    nit: string;
  };
  fechaRegistro: Date;
}


const userSchema = new Schema<User>({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['ti', 'cc', 'ce']
  },
  numeroDocumento: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  telefono: {
    type: String,
    required: true,
    match: /^[0-9]{10,15}$/
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  esVendedor: {
    type: Boolean,
    default: false
  },
  datosVendedor: {
    tipoActividad: {
      type: String,
      enum: ['individual', 'empresa'],
      required: function() { return this.esVendedor; }
    },
    nombreEmpresa: {
      type: String,
      required: function() { return this.esVendedor && this.datosVendedor?.tipoActividad === 'empresa'; }
    },
    descripcionEmpresa: {
      type: String,
      required: function() { return this.esVendedor && this.datosVendedor?.tipoActividad === 'empresa'; }
    },
    nit: {
      type: String,
      required: function() { return this.esVendedor; },
      match: /^[0-9-]+$/
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const User = mongoose.model<User>('User', userSchema);