import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Recommended Stripe config for webhooks
export const dynamic = 'force-dynamic'; // Ensure no static behavior
export const runtime = 'nodejs'; // Stripe SDK works better in Node.js runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
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
    
    // Add more event types as needed
    
    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
