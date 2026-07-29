import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('ERRO CRÍTICO: STRIPE_SECRET_KEY não encontrada no .env do backend.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-12-18.acacia',
});
