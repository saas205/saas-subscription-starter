import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  // ✅ Handle Stripe event types here
  switch (event.type) {
    case "checkout.session.completed":
      console.log("✅ Payment successful:", event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response("Webhook received", { status
