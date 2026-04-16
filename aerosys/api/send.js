// api/send.js — Vercel Serverless Function
// Sends real email via Resend API (free tier: 3,000 emails/month)
// Set RESEND_API_KEY in Vercel Environment Variables

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, body, from = 'AeroSysMail <noreply@aerosys.aero>' } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'to and subject are required' });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_KEY) {
    // Graceful degradation — log and return success so the UI works without the key
    console.log(`[SEND] to=${to} subject="${subject}" (no RESEND_API_KEY set — logged only)`);
    return res.status(200).json({ status: 'sent', id: `local_${Date.now()}`, note: 'logged_only' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: body || subject,
        text: body ? body.replace(/<[^>]+>/g, '') : subject,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[SEND] Resend error:', data);
      return res.status(502).json({ error: data.message || 'Email service error' });
    }

    return res.status(200).json({ status: 'sent', id: data.id });
  } catch (err) {
    console.error('[SEND] Fetch error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
