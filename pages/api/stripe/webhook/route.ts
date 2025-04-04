import { NextRequest } from 'next/server';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const buf = await buffer(req.body as any);
  const sig = req.headers.get('stripe-signature')!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed.', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // Optional: Handle specific events
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('✅ Payment success!');
      break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return new Response('Webhook received', { status: 200 });
}
