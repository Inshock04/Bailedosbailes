/**
 * Utilitário Seguro de Sincronização
 * 
 * SEGURANÇA E PRIVACIDADE:
 * Nenhuma chave secreta ou token de banco de dados é exposto no bundle do front-end.
 * Todas as requisições de persistência passam pelos endpoints protegidos do backend (/api/).
 */

export interface GuestEntryPayload {
  name: string;
  phone: string;
  token?: string;
  eventName?: string;
  status?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/**
 * Envia confirmação de RSVP para persistência segura no backend
 */
export async function syncGuestListToSupabase(entry: GuestEntryPayload) {
  const res = await fetch('/api/guestlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Não foi possível salvar na Lista VIP.');
  return data;
}

/**
 * Envia mensagem de contato para persistência segura no backend
 */
export async function syncContactToSupabase(entry: ContactPayload) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar a mensagem.');
  return data;
}
