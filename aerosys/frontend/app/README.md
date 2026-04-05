# AeroSysMail — Vercel Deployment

## Why it was 404ing
Vercel looked for `index.html` at the **root** of the deploy directory.  
The file was nested at `aerosys/frontend/index.html` with no `vercel.json` routing.

## Fix applied
1. `index.html` moved to **root** of `aerosys/` directory
2. `vercel.json` added — SPA rewrites + security headers

## Deploy to Vercel

```bash
# Option A — Vercel CLI
npm i -g vercel
cd aerosys
vercel --prod

# Option B — GitHub integration
# Push to GitHub → Import repo in vercel.com
# Root Directory: aerosys   (set this in Vercel project settings)
# Framework Preset: Other
# Build Command: (leave empty)
# Output Directory: . (dot = root)
```

## Project structure for Vercel

```
aerosys/              ← Vercel deploy root
├── vercel.json       ← Routing + headers
├── index.html        ← Full SPA (email + CRM + domains)
├── README.md
└── api/              ← Vercel serverless functions (optional)
    └── send.js
```

## Features (all work on Vercel — no backend needed)

| Feature | Status |
|---|---|
| Email inbox, reader, reply, compose | ✅ Live |
| Smart AI reply suggestions | ✅ Live |
| Voice command UI | ✅ Live |
| Business Autopilot dashboard | ✅ Live |
| Deal pipeline (4-stage kanban) | ✅ Live |
| Revenue tracker chart | ✅ Live |
| AI business insights | ✅ Live |
| Invoice & task management | ✅ Live |
| Domain Manager + DNS records | ✅ Beta |
| Domain search & registration UI | ✅ Beta |
| MX / DKIM / SPF / DMARC display | ✅ Beta |
| Settings (SMTP, IMAP, AI, Billing) | ✅ Live |
| Notification panel | ✅ Live |
| localStorage data persistence | ✅ Live |
| Team Inbox | 🔜 Soon |
| Transactional Email API | 🔜 Planned |
