import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './src/users';
import { connectDB } from './src/db';

connectDB();

dotenv.config()

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', usersRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});