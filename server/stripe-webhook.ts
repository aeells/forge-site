import type { Request, Response } from "express";
import Stripe from "stripe";
import { createOrUpdateSubscription } from "./db";
import { getUserByOpenId } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log("[Webhook] Received event:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout completed:", session.id);

        // Extract user info from metadata
        const userId = session.metadata?.user_id;
        const customerEmail = session.metadata?.customer_email;

        if (!userId) {
          console.error("[Webhook] Missing user_id in session metadata");
          break;
        }

        // Save subscription info
        await createOrUpdateSubscription({
          userId: parseInt(userId, 10),
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        });

        console.log("[Webhook] Subscription created for user:", userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription updated:", subscription.id);

        // Find user by customer ID
        const customerId = subscription.customer as string;
        
        await createOrUpdateSubscription({
          userId: 0, // Will be updated based on existing record
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          status: subscription.status,
          currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined,
        });

        console.log("[Webhook] Subscription status updated to:", subscription.status);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription deleted:", subscription.id);

        const customerId = subscription.customer as string;

        await createOrUpdateSubscription({
          userId: 0,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          status: "canceled",
        });

        console.log("[Webhook] Subscription canceled");
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
