import { Router } from "express";
import { User } from './models/user.model';
import bcrypt from 'bcrypt';

const router = Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    console.log('Received data:', req.body);

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Guardar usuario con contraseña encriptada
    const userData = { ...req.body, password: hashedPassword };
    const user = await User.create(userData);
    console.log('User created successfully:', user._id);

    // Retornar usuario sin contraseña
    const { password, ...userResponse } = user.toObject();
    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // ✅ Asegúrate de que el modelo User incluya esVendedor
    const { password: _, ...userResponse } = user.toObject();
    return res.json({ user: userResponse, message: 'Login exitoso' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
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
    return res.json(userResponse);

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

export default router;
