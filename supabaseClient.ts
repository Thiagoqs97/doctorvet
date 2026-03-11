import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Tenta pegar do ambiente (.env via Vite)
const getEnv = (key: string): string => {
  return import.meta.env[key] ?? import.meta.env[`VITE_${key}`] ?? '';
};

// 2. Se não tiver no ambiente, tenta pegar do LocalStorage (configurado via UI)
const getStoredConfig = (): { url?: string; key?: string } | null => {
  try {
    const stored = localStorage.getItem('doctor_vet_config');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const envUrl = getEnv('SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY');
const storedConfig = getStoredConfig();

const supabaseUrl = envUrl || storedConfig?.url || '';
const supabaseAnonKey = envKey || storedConfig?.key || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.log('ℹ️ Supabase não configurado. O app rodará com dados vazios/mock até que as chaves sejam inseridas.');
}

export const supabase: SupabaseClient | null = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Função para salvar as chaves via UI
export const saveSupabaseConfig = (url: string, key: string) => {
  if (!url || !key) return;
  localStorage.setItem('doctor_vet_config', JSON.stringify({ url, key }));
  window.location.reload(); // Recarrega para aplicar a nova conexão
};

// Função para limpar configuração
export const clearSupabaseConfig = () => {
  localStorage.removeItem('doctor_vet_config');
  window.location.reload();
};

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