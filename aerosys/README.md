# AeroSysMail — Business Autopilot

> AI-powered email + CRM platform with full Docker stack

## Stack

| Service   | Image/Tech              | Port(s)         | Purpose                        |
|-----------|-------------------------|-----------------|--------------------------------|
| **nginx** | nginx:alpine            | 80, 443         | Reverse proxy, static files    |
| **api**   | node:18-alpine          | 3000            | REST API (Express + JWT)       |
| **db**    | mysql:8                 | 3306            | Primary database               |
| **redis** | redis:7-alpine          | 6379            | Session cache, API cache       |
| **minio** | minio/minio             | 9000, 9001      | Email attachment storage       |
| **postfix**| ubuntu:22.04           | 25, 587         | SMTP relay (outbound mail)     |
| **dovecot**| ubuntu:22.04           | 143, 993        | IMAP server (inbound mail)     |

## Quick Start

```bash
# 1. Clone and enter
cd aerosys

# 2. Start full stack
docker compose up -d

# 3. Wait ~30s for DB init, then open
open http://localhost

# Default credentials (seeded)
# Email:    alex@aerosys.aero
# Password: password123
```

## API Reference

### Auth
| Method | Endpoint              | Body                         | Description        |
|--------|-----------------------|------------------------------|--------------------|
| POST   | /api/auth/register    | {name, email, password}      | Register user      |
| POST   | /api/auth/login       | {email, password}            | Login → JWT token  |
| POST   | /api/auth/logout      | —                            | Invalidate session |
| GET    | /api/auth/me          | —                            | Current user info  |

### Emails
| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | /api/inbox?folder=inbox       | List emails (inbox/sent/drafts...) |
| GET    | /api/emails/:id               | Get email + attachments            |
| POST   | /api/send                     | Send email via Postfix             |
| PATCH  | /api/emails/:id               | Update (read/star/move)            |
| DELETE | /api/emails/:id               | Trash email                        |
| POST   | /api/emails/bulk              | Bulk read/move/delete              |
| POST   | /api/emails/:id/attachments   | Upload attachment → MinIO          |
| GET    | /api/attachments/:id/download | Presigned download URL             |

### Deals
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /api/deals            | List deals (filter by stage)   |
| GET    | /api/deals/pipeline   | Full kanban pipeline           |
| GET    | /api/deals/:id        | Deal + tasks                   |
| POST   | /api/deals            | Create deal                    |
| PUT    | /api/deals/:id        | Update deal                    |
| PATCH  | /api/deals/:id/stage  | Move stage                     |
| DELETE | /api/deals/:id        | Delete deal                    |

### Invoices
| Method | Endpoint                     | Description           |
|--------|------------------------------|-----------------------|
| GET    | /api/invoices                | List invoices         |
| POST   | /api/invoices                | Create invoice        |
| PATCH  | /api/invoices/:id/status     | Update status         |
| DELETE | /api/invoices/:id            | Delete invoice        |

### Clients, Tasks, Analytics
```
GET  /api/clients              GET  /api/tasks
GET  /api/clients/:id         POST /api/tasks
POST /api/clients             PATCH /api/tasks/:id

GET  /api/analytics/dashboard   ← KPIs, pipeline, AI insights
GET  /api/analytics/revenue     ← Monthly revenue breakdown

POST /api/ai/smart-reply        ← Smart reply suggestions

GET  /api/health                ← All service health checks
```

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Frontend

The React-like SPA at `backend/public/index.html` is served by Express and proxied
through Nginx. It communicates exclusively with the API using `fetch()`.

### View Inheritance Model
```
Parent: Email Dashboard (index.html — EmailView)
  └─ Child: Business Autopilot (AutopilotView)
       Inherits: sidebar, topbar, CSS tokens, nav shell
       Specializes: KPI cards, deal pipeline, revenue chart
```

## Services Access

| Service          | URL / Connection               |
|------------------|-------------------------------|
| App (frontend)   | http://localhost               |
| API (direct)     | http://localhost:3000          |
| MinIO console    | http://localhost:9001 (minio/minio123) |
| MySQL            | localhost:3306 (aerosys/secret)|
| Redis            | localhost:6379                 |
| SMTP             | localhost:587                  |
| IMAP             | localhost:993                  |

## File Structure

```
aerosys/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   ├── api/
│   │   └── server.js          ← Full REST API (700+ lines)
│   ├── db/
│   │   └── init.sql           ← Schema + seed data
│   └── public/
│       └── index.html         ← Frontend SPA
├── nginx/
│   └── nginx.conf             ← Rate-limited reverse proxy
├── postfix/
│   ├── Dockerfile
│   └── config/
│       ├── main.cf
│       └── master.cf
└── dovecot/
    ├── Dockerfile
    └── config/
        ├── dovecot.conf
        └── users
```
