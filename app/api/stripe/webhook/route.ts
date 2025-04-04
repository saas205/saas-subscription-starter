import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

import { Readable } from 'stream';

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const rawBody = await req.text(); // 👈 This gives raw body

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // ✅ Handle event
  if (event.type === 'checkout.session.completed') {
    console.log('✅ Checkout completed:', event.data.object);
  }

  return new Response('Webhook received', { status: 200 });
}
