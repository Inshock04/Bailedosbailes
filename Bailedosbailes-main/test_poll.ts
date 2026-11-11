import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: order } = await supabase.from('ticket_orders').select('*').limit(1).order('created_at', { ascending: false });
  console.log('Latest order:', order);
  const res = await fetch('http://localhost:3000/api/orders/' + order[0].id + '/status');
  console.log('Poll status:', await res.json());
}
test();
