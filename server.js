import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis do arquivo .env na raiz
dotenv.config({ path: path.resolve(__dirname, './.env') });

import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
}));

// Rota do Webhook do Stripe (deve vir ANTES de express.json())
app.use('/api', webhookRoutes);

// Demais rotas em formato JSON
app.use(express.json());
app.use('/api', paymentRoutes);

// Health check da API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'LooksNow Unified Server', 
    timestamp: new Date().toISOString() 
  });
});

// Servir arquivos estáticos do frontend React compilado (dist)
const distPath = path.resolve(__dirname, './dist');
app.use(express.static(distPath));

// Fallback SPA para rotas do React (qualquer requisição que não seja /api)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor LooksNow rodando na porta ${PORT}`);
  console.log(`🔗 Web App & API: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
