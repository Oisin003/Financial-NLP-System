import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { sequelize } from './models/User.js';
import './models/Document.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

sequelize.sync()
  .then(() => console.log('✓ Database connected and synced'))
  .catch((err) => console.error('Database connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
