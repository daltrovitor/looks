import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Permite requisições do frontend React (http://localhost:5173)
}));

// Rota do Webhook do Stripe (deve vir ANTES de express.json())
app.use('/api', webhookRoutes);

// Demais rotas em formato JSON
app.use(express.json());
app.use('/api', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'LooksNow Payment Backend', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Backend LooksNow Stripe rodando na porta ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 Webhook: http://localhost:${PORT}/api/webhook`);
  console.log(`====================================================`);
});
