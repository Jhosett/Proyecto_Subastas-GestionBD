// controllers/adminController.ts
import { Request, Response } from 'express';
import { Status } from '../models/status.model';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { pais, rol, desde, hasta, search } = req.query;

    // Construimos dinámicamente el filtro
    const filter: any = {};

    if (pais) filter.pais = pais;
    if (rol) filter.rol = rol;

    // Filtrar por rango de fechas
    if (desde || hasta) {
      filter.fechaRegistro = {};
      if (desde) filter.fechaRegistro.$gt = new Date(desde as string);
      if (hasta) filter.fechaRegistro.$lt = new Date(hasta as string);
    }

    // Búsqueda por nombre o email (usando $or)
    if (search) {
      filter.$or = [
        { nombre: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const usuarios = await Status.find(filter);
    res.json(usuarios);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};
