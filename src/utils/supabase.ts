import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  'https://upijucscuvnxeqdetrhm.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  'sb_publishable_VX-bnvZULI5fyOJgSnZ_Xw_CuAwWZuy';

/**
 * Cliente Supabase Oficial para o Hotel Cortez / The Triplex
 * Conectado ao projeto: upijucscuvnxeqdetrhm
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseGuestEntry {
  id?: string;
  name: string;
  phone: string;
  token?: string;
  eventName?: string;
  status?: string;
  createdAt?: string;
}

export interface SupabaseContactEntry {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
}

/**
 * Salva convidado da lista VIP no Supabase
 */
export async function syncGuestListToSupabase(entry: SupabaseGuestEntry) {
  try {
    const { data, error } = await supabase
      .from('guest_list')
      .insert([
        {
          name: entry.name,
          phone: entry.phone,
          token: entry.token,
          event_name: entry.eventName || 'Halloween Party Hotel Cortez 2026',
          status: entry.status || 'CONFIRMADO',
          created_at: entry.createdAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('[Supabase Sync Warning] Tabela guest_list:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase Sync Exception]', err);
    return null;
  }
}

/**
 * Salva mensagem de contato no Supabase
 */
export async function syncContactToSupabase(entry: SupabaseContactEntry) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: entry.name,
          email: entry.email,
          message: entry.message,
          created_at: entry.createdAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('[Supabase Sync Warning] Tabela contacts:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase Sync Exception]', err);
    return null;
  }
}
