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
    console.log(methods.map((m: any) => m.id).join(', '));
  } catch (err) {
    console.error(err);
  }
}

checkPaymentMethods();
