import mongoose, { Document, Schema } from 'mongoose';


// Definición de la interfaz Status y los campos del esquema
export interface Status extends Document {
  userId: string;
  nombre: string;
  email: string;
  fechaRegistro: Date;
  loginTime: Date;
  logoutTime?: Date;
  rol: string;
  pais: string;
  departamento: string;
  ciudad: string;
  sessionActive: boolean;
  clickedCategories: string[];
  bidAttempts: number;
}

// Esquema de Mongoose para el modelo Status
const statusSchema = new Schema<Status>({
  userId: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  fechaRegistro: {
    type: Date,
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date
  },
  rol: {
    type: String,
    required: true
  },
  pais: {
    type: String,
    required: true
  },
  departamento: {
    type: String,
    required: true
  },
  ciudad: {
    type: String,
    required: true
  },
  sessionActive: {
    type: Boolean,
    default: true
  },
  clickedCategories: {
    type: [String],
    default: []
  },
  bidAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Status = mongoose.model<Status>('Status', statusSchema);