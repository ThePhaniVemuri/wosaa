# Wosaa

Wosaa is a full‑stack freelance marketplace (React + Vite frontend, Node/Express backend, MongoDB) connecting clients and freelancers with gigs, chat, contracts, and payments.

live at: https://wosaa.vercel.app/

## Features
- Role-based auth for clients and freelancers
- Post, browse, and apply to gigs
- Realtime chat (WebSockets)
- Contracts and payments workflow
- Webhook handlers and email utilities

## Repo Layout (high level)
- `backend/` — Express API, controllers, routes, models, middleware, utils, webhooks
- `frontend/` — Vite + React app, Tailwindcss, components, API helpers, socket service, context

## Prerequisites
- Node.js v16+ (or latest LTS)
- npm or yarn
- MongoDB (Atlas or local)
- Optional: SMTP credentials for email integrations, any payment provider credentials used by the backend

## Environment (example)
Create a `.env` in `backend/` with values similar to the example below.

```env
# backend/.env.example
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/wosaa?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password
# Add any webhook or payment provider keys here
```
