import { Router } from "express";
import { User } from './models/user.model';
import bcrypt from 'bcrypt';

const router = Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    console.log('Received data:', req.body);

    // Validar campos únicos
    const { email, numeroDocumento, telefono, datosVendedor } = req.body;
    
    const existingUser = await User.findOne({
      $or: [
        { email },
        { numeroDocumento },
        { telefono }
      ]
    });

    if (existingUser) {
      let field = '';
      if (existingUser.email === email) field = 'correo electrónico';
      else if (existingUser.numeroDocumento === numeroDocumento) field = 'número de documento';
      else if (existingUser.telefono === telefono) field = 'teléfono';
      
      return res.status(400).json({ error: `El ${field} ya está registrado` });
    }

    // Validar NIT si es vendedor
    if (datosVendedor?.nit) {
      const existingNit = await User.findOne({ 'datosVendedor.nit': datosVendedor.nit });
      if (existingNit) {
        return res.status(400).json({ error: 'El NIT ya está registrado' });
      }
    }

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

    // Update login timestamp
    user.ultimoLogin = new Date();
    await user.save();
    
    const { password: _, ...userResponse } = user.toObject();
    return res.json({ user: userResponse, message: 'Login exitoso' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Validar campos únicos
router.post('/validate', async (req, res) => {
  try {
    const { field, value, userId } = req.body;
    const query: any = { [field]: value };
    if (userId) query._id = { $ne: userId };
    
    const exists = await User.findOne(query);
    return res.json({ exists: !!exists });
  } catch (error) {
    return res.status(500).json({ error: 'Error de validación' });
  }
});

// Logout de usuario
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { ultimoLogout: new Date() });
    return res.json({ message: 'Logout registrado' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Error en logout' });
  }
});

// Obtener todos los usuarios (solo para admin)
router.get('/users', async (_, res) => {
  try {
    const users = await User.find({}, '-password').sort({ fechaRegistro: -1 });
    return res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
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
