import dotenv from 'dotenv';
dotenv.config();

const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
console.log('Token prefix:', token ? token.split('-')[0] : 'Not found');
