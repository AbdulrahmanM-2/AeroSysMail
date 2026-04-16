import Stripe       from 'stripe';
import { getDB }     from '../../lib/db.js';
import { handleCors } from '../../lib/cors.js';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig    = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const db = getDB();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { user_id, plan_id, domain_id } = session.metadata;
      await db.from('subscriptions').update({
        status: 'active',
        stripe_subscription_id: session.subscription,
        stripe_customer_id:     session.customer,
        current_period_start:   new Date(),
        current_period_end:     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).eq('user_id', user_id).eq('status', 'pending');

      // Assign domain if provided
      if (domain_id) await db.from('domains').update({ assigned_to: user_id }).eq('id', domain_id);

      // Create invoice record
      const { data: plan } = await db.from('plans').select('*').eq('id', plan_id).single();
      if (plan) {
        const invNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
        await db.from('invoices').insert({
          user_id, inv_number: invNumber,
          amount: session.amount_total / 100,
          status: 'paid', paid_at: new Date(), due_date: new Date(),
          stripe_invoice_id: session.id,
          line_items: [{ description: `${plan.name} Plan`, amount: session.amount_total / 100 }],
        });
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await db.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await db.from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date() })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      await db.from('subscriptions').update({
        status: sub.status === 'active' ? 'active' : sub.status,
        current_period_end: new Date(sub.current_period_end * 1000),
      }).eq('stripe_subscription_id', sub.id);
      break;
    }
  }

  return res.json({ received: true });
}
