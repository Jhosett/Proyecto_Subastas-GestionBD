import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './src/users';
import { connectDB } from './src/db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', usersRouter);

// Add a test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 8000;

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Database connected successfully`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();