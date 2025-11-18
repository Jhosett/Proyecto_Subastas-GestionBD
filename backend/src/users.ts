import { Router } from "express";
import { User } from './models/user.model';
import { Status } from './models/status.model';
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

    // Create new status record for this login session
    const rol = user.isAdmin ? 'Administrador' : (user.esVendedor ? 'Vendedor' : 'Comprador');
    try {
      await Status.create({
        userId: user._id,
        nombre: user.nombre,
        email: user.email,
        fechaRegistro: user.fechaRegistro,
        loginTime: new Date(),
        rol,
        pais: user.pais,
        departamento: user.departamento,
        ciudad: user.ciudad,
        sessionActive: true
      });
    } catch (statusError: any) {
      if (statusError.code === 11000) {
        // Drop the unique index and try again
        try {
          await Status.collection.dropIndex('userId_1');
          await Status.create({
            userId: user._id,
            nombre: user.nombre,
            email: user.email,
            fechaRegistro: user.fechaRegistro,
            loginTime: new Date(),
            rol,
            pais: user.pais,
            departamento: user.departamento,
            ciudad: user.ciudad,
            sessionActive: true
          });
        } catch (retryError) {
          console.error('Error creating status after dropping index:', retryError);
        }
      }
    }
    
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
    
    // Update the most recent active session
    await Status.findOneAndUpdate(
      { userId, sessionActive: true },
      { 
        logoutTime: new Date(),
        sessionActive: false
      },
      { sort: { loginTime: -1 } }
    );
    
    return res.json({ message: 'Logout registrado' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Error en logout' });
  }
});

// Drop unique index on userId (run once)
router.post('/drop-index', async (_, res) => {
  try {
    await Status.collection.dropIndex('userId_1');
    return res.json({ message: 'Index dropped successfully' });
  } catch (error) {
    console.log('Index may not exist or already dropped:', error);
    return res.json({ message: 'Index handled' });
  }
});

// Obtener todos los usuarios (solo para admin)
router.get('/users', async (req, res) => {
  try {
    const { pais, rol, desde, hasta, search } = req.query;

    const filter: any = {};

    if (pais) filter.pais = pais;
    if (rol) filter.rol = rol;

    if (desde || hasta) {
      filter.loginTime = {};
      if (desde) filter.loginTime.$gte = new Date(desde as string);
      if (hasta) filter.loginTime.$lte = new Date(hasta as string);
    }

    if (search) {
      filter.$or = [
        { nombre: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const users = await Status.find(filter).sort({ loginTime: -1 });
    return res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Track user actions
router.post('/track-action', async (req, res) => {
  try {
    const { userId, category } = req.body;
    
    await Status.findOneAndUpdate(
      { userId, sessionActive: true },
      { $addToSet: { clickedCategories: category } },
      { sort: { loginTime: -1 } }
    );
    
    return res.json({ message: 'Action tracked' });
  } catch (error) {
    console.error('Track action error:', error);
    return res.status(500).json({ error: 'Error tracking action' });
  }
});

// Track bid attempts
router.post('/track-bid', async (req, res) => {
  try {
    const { userId } = req.body;
    
    await Status.findOneAndUpdate(
      { userId, sessionActive: true },
      { $inc: { bidAttempts: 1 } },
      { sort: { loginTime: -1 } }
    );
    
    return res.json({ message: 'Bid tracked' });
  } catch (error) {
    console.error('Track bid error:', error);
    return res.status(500).json({ error: 'Error tracking bid' });
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
