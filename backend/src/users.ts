import { Router } from "express";
import { User } from '../models/user.model';
//import {db} from "./db";

const router = Router();

router.post('/register', async(req, res) => {
    try {
      console.log('Received data:', req.body);
      const user = await User.create(req.body);
      console.log('User created successfully:', user);
      res.json(user)
    } catch (error) {
      console.error('Detailed error:', error); // This will show the real error
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  });
  

export default router;