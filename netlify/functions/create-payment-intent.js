// netlify/functions/create-payment-intent.js
// Crea una Stripe Checkout Session y devuelve la URL de pago.
// El cliente es redirigido a stripe.com — nunca toca datos de tarjeta en este sitio.

import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

function generateOrderId() {
  const now  = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const seq  = String(now.getHours()*10000 + now.getMinutes()*100 + now.getSeconds()).padStart(6,'0');
  return `DCO-${date}-${seq}`;
}

function loadProducts() {
  const jsonPath = join(process.cwd(), 'data/products.json');
  const raw  = readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  if (!data.products || !Array.isArray(data.products)) {
    throw new Error('products.json has no products array');
  }

  const map = {};
  for (const p of data.products) {
    if (!p.boxPriceCents || p.boxPriceCents <= 0) {
      throw new Error(`Product ${p.id} (${p.name}) has invalid boxPriceCents: ${p.boxPriceCents}`);
    }
    map[String(p.id)] = { name: p.name, price: p.boxPriceCents };
  }
  return map;
}

export const handler = async (event) => {

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let PRODUCTS;
  try {
    PRODUCTS = loadProducts();
  } catch (err) {
    console.error('Failed to load products.json:', err.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Product catalog unavailable. Please try again later.' }),
    };
  }

  try {
    const { cart, customerEmail, customerPhone, customerName } = JSON.parse(event.body);

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Invalid cart' }) };
    }

    const lineItems = [];

    for (const item of cart) {
      const product = PRODUCTS[String(item.id)];
      if (!product) {
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: `Product ${item.id} not found` }) };
      }
      const quantity = parseInt(item.qty);
      if (!quantity || quantity < 1 || quantity > 99) {
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: `Invalid quantity for product ${item.id}` }) };
      }
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity,
      });
    }

    const orderId  = generateOrderId();
    const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl  = process.env.URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:           lineItems,
      mode:                 'payment',
      customer_email:       customerEmail || undefined,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      metadata: {
        order_id:       orderId,
        customer_name:  customerName  || '',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        source:         'docolco-website',
      },
      success_url: `${siteUrl}/?success=true&order_id=${orderId}`,
      cancel_url:  `${siteUrl}/`,
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ url: session.url, orderId }),
    };

  } catch (error) {
    console.error('Stripe error:', error.message);
    const statusCode = error.type === 'StripeCardError' ? 400 : 500;
    return {
      statusCode,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Payment processing failed. Please try again.' }),
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}
