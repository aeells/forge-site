import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { createContactSubmission, getUserSubscription } from "./db";
import { PRICING_TIERS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  stripe: router({
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          tier: z.enum(["starter", "professional", "enterprise"]),
          billingPeriod: z.enum(["monthly", "annual"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { tier, billingPeriod } = input;
        const tierConfig = PRICING_TIERS[tier];
        const priceId = billingPeriod === "monthly" ? tierConfig.monthlyPriceId : tierConfig.annualPriceId;

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin}/?success=true`,
          cancel_url: `${ctx.req.headers.origin}/?canceled=true`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
            tier,
            billing_period: billingPeriod,
          },
          allow_promotion_codes: true,
        });

        return { url: session.url };
      }),

    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSubscription(ctx.user.id);
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          company: z.string().optional(),
          message: z.string().min(10, "Message must be at least 10 characters"),
        })
      )
      .mutation(async ({ input }) => {
        await createContactSubmission({
          name: input.name,
          email: input.email,
          company: input.company || null,
          message: input.message,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
