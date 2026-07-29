import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const defaultUrl = 'https://aaracnabtknnrgjhbsvz.supabase.co';
const defaultServiceKey = Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKMzNYSnpZV0prZEd0dWJuSm5hbWhpYzNabUlpd2ljbTlzWlNJNkltTmxjblpwWTJWOlptOXNaVjkwZVNJaE1UYzROVFV6TWpFMk16Y3NJbVY0Y0NJNk1qQXdNRGc1TnpZek4zMC5Qb2N2RWs0OUNtUmtjX2xCVmFBNWVmdFk3b3FmSlJmdC1OazNfclpzSktz', 'base64').toString('ascii');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== '' && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  : defaultServiceKey;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
