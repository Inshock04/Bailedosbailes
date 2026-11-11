import dotenv from 'dotenv';
dotenv.config();

async function testMp() {
  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  
  const preferenceData = {
      items: [
        {
          id: 't-open-45',
          title: 'INGRESSO OPEN BAR',
          description: `Lote: 1 | Qtd: 1`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 45
        }
      ],
      payer: {
        name: 'Visitante',
      },
      external_reference: '12345678-1234-1234-1234-123456789012',
      metadata: {
        seller: null,
        phone: '11999999999',
        order_id: '12345678-1234-1234-1234-123456789012'
      },
      back_urls: {
        success: `https://localhost:3000/?payment=success`,
        failure: `https://localhost:3000/?payment=failure`,
        pending: `https://localhost:3000/?payment=pending`
      },
      auto_return: 'approved'
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData)
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(data, null, 2));
}

testMp();
