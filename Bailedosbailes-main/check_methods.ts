import dotenv from 'dotenv';
dotenv.config();

async function checkPaymentMethods() {
  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  
  try {
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    });
    
    const methods = await response.json();
    
    if (!response.ok) {
      console.error('Error fetching payment methods:', methods);
      return;
    }
    
    const pixMethod = methods.find((m: any) => m.id === 'pix');
    
    console.log('--- AVAILABLE PAYMENT METHODS ---');
    console.log(`Total methods available: ${methods.length}`);
    if (pixMethod) {
      console.log('Pix IS AVAILABLE on this account.');
      console.log('Pix details:', JSON.stringify(pixMethod, null, 2));
    } else {
      console.log('Pix IS NOT AVAILABLE in the payment_methods endpoint for this account.');
      console.log('Available method types:', [...new Set(methods.map((m: any) => m.payment_type_id))].join(', '));
    }
    
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

checkPaymentMethods();
