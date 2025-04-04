// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Stripe needs Node.js runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31', // Match your Stripe dashboard version
});

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  console.log('✅ Webhook received:', event.type);

  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('💰 Payment received:', session.id);
      // Add your business logic here
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('💵 Invoice paid:', invoice.id);
      // Add your business logic here
      break;
    
    case 'product.updated':
      const product = event.data.object;
      console.log('🔄 Product updated:', product.id);
      // Add your business logic here
      break;
    
    // Add more event types as needed
    
    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
