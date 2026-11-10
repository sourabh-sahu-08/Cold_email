import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ColdMail API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server after connecting to database
const startServer = async () => {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 ColdMail API running on http://localhost:${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`=========================================`);
  });
};

startServer().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
