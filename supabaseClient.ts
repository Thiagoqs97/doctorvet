import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.log('ℹ️ Supabase não configurado via variáveis de ambiente. Verifique o arquivo .env ou a configuração na Vercel.');
}

export const supabase: SupabaseClient | null = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const checkDbConnection = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('professionals').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    console.error('Supabase connection error:', e);
    return false;
  }
};