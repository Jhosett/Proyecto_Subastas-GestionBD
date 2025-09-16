import { Router } from "express";
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', async(req, res) => {
    try {
      console.log('Received data:', req.body);
      
      //Función que encripta las contraseñas
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      
      //Guarda al usuario con su contraseña encriptada
      const userData = {
        ...req.body,
        password: hashedPassword
      };
      
      const user = await User.create(userData);
      console.log('User created successfully:', user._id);
      
      // Return user without password
      const { password, ...userResponse } = user.toObject();
      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  });

router.post('/login', async(req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Return user data without password
    const { password: _, ...userResponse } = user.toObject();
    res.json({ user: userResponse, message: 'Login exitoso' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/users/:id', async(req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, direccion } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nombre, telefono, direccion },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const { password, ...userResponse } = updatedUser.toObject();
    res.json(userResponse);
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});
  

export default router;