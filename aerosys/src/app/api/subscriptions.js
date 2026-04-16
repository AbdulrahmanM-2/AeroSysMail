import Stripe        from 'stripe';
import { getDB }      from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { handleCors }  from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;

  const db     = getDB();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // ── GET: user's subscriptions ─────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await db.from('subscriptions')
      .select(`*, plan:plans(name,slug,price_monthly,price_yearly,features,storage_gb,email_accounts), domain:domains(name)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // ── POST: create Stripe Checkout session ─────────────────
  if (req.method === 'POST') {
    const { plan_id, billing_cycle = 'monthly', domain_id, success_url, cancel_url } = req.body || {};
    if (!plan_id) return res.status(400).json({ error: 'plan_id required' });

    const { data: plan } = await db.from('plans').select('*').eq('id', plan_id).single();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const { data: userData } = await db.from('users').select('*').eq('id', user.id).single();
    const appUrl = process.env.APP_URL || 'https://aero-sys-mail.vercel.app';

    // Use Stripe price IDs if configured, otherwise create inline price
    const priceId = billing_cycle === 'yearly' ? plan.stripe_price_yearly : plan.stripe_price_monthly;

    let lineItems;
    if (priceId) {
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      // Fallback: inline price (for initial setup before Stripe products are created)
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: { name: `AeroSysMail ${plan.name}`, description: `${billing_cycle} hosting plan` },
          unit_amount: Math.round((billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly) * 100),
          recurring: { interval: billing_cycle === 'yearly' ? 'year' : 'month' },
        },
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create({
      mode:               'subscription',
      customer_email:     userData.email,
      line_items:         lineItems,
      metadata:           { user_id: user.id, plan_id, domain_id: domain_id || '', billing_cycle },
      success_url:        success_url || `${appUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url:         cancel_url  || `${appUrl}?status=cancelled`,
      subscription_data:  { metadata: { user_id: user.id, plan_id } },
      allow_promotion_codes: true,
    });

    // Pre-create subscription record as 'pending' (updated to 'active' via webhook)
    await db.from('subscriptions').insert({
      user_id: user.id, plan_id, domain_id: domain_id || null,
      billing_cycle, status: 'pending',
    });

    return res.json({ url: session.url, session_id: session.id });
  }

  // ── DELETE: cancel subscription ───────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Subscription id required' });
    const { data: sub } = await db.from('subscriptions').select('*').eq('id', id).eq('user_id', user.id).single();
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    if (sub.stripe_subscription_id) {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }
    await db.from('subscriptions').update({ status: 'cancelled', cancelled_at: new Date() }).eq('id', id);
    return res.json({ status: 'cancelled' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
