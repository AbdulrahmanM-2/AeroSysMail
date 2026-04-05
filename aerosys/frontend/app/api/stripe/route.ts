
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET!);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "Pro Plan" },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: "subscription",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  return Response.json({ url: session.url });
}
