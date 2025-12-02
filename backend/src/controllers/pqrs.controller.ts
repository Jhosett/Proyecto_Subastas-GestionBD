import { Request, Response } from 'express';
import PQRS from '../models/pqrs.model';
import { PQRSEmailService } from '../services/pqrs-email.service';
import Product from '../models/product.model';

export class PQRSController {
  // Create new PQRS
  async createPQRS(req: Request, res: Response): Promise<void> {
    try {
      const { type, subject, description, productId, relatedUserId, isAnonymous } = req.body;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const newPQRS = new PQRS({
        type,
        subject,
        description,
        productId: productId || undefined,
        relatedUserId: relatedUserId || undefined,
        isAnonymous,
        userId
      });

      const savedPQRS = await newPQRS.save();
      
      // Send email notification
      await PQRSEmailService.sendPQRSNotification(savedPQRS);
      
      res.status(201).json(savedPQRS);
    } catch (error) {
      console.error('Error creating PQRS:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Get all PQRS (admin only)
  async getAllPQRS(_req: Request, res: Response): Promise<void> {
    try {
      const pqrsList = await PQRS.find().sort({ createdAt: -1 });
      res.json(pqrsList);
    } catch (error) {
      console.error('Error fetching PQRS:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Get PQRS by user
  async getUserPQRS(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const userPQRS = await PQRS.find({ userId }).sort({ createdAt: -1 });
      res.json(userPQRS);
    } catch (error) {
      console.error('Error fetching user PQRS:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Update PQRS status (admin only)
  async updatePQRSStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, response } = req.body;

      const updateData: any = { status };
      if (response) {
        updateData.response = response;
        updateData.responseDate = new Date();
      }

      const updatedPQRS = await PQRS.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!updatedPQRS) {
        res.status(404).json({ error: 'PQRS no encontrado' });
        return;
      }

      // Send response email if there's a response
      if (response && updatedPQRS) {
        await PQRSEmailService.sendPQRSResponse(updatedPQRS, response);
      }

      res.json(updatedPQRS);
    } catch (error) {
      console.error('Error updating PQRS:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Get PQRS by ID
  async getPQRSById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pqrs = await PQRS.findById(id);
      
      if (!pqrs) {
        res.status(404).json({ error: 'PQRS no encontrado' });
        return;
      }

      res.json(pqrs);
    } catch (error) {
      console.error('Error fetching PQRS by ID:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Get PQRS notifications for user (as recipient)
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      // Find user's products to get PQRS related to them
      const userProducts = await Product.find({ vendedorId: userId });
      const productIds = userProducts.map(p => (p._id as any).toString());

      // Get PQRS where user is directly related or owns the product
      const notifications = await PQRS.find({
        $or: [
          { relatedUserId: userId },
          { productId: { $in: productIds } }
        ],
        userId: { $ne: userId } // Exclude own PQRS
      }).sort({ createdAt: -1 });

      res.json(notifications);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}