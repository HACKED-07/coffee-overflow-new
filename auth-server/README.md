# Auth.js Server (Standalone)

A minimal Auth.js server providing Google and GitHub OAuth for the Terra Spark Net frontend.

## Quick Start

1. Install dependencies

```bash
cd terra-spark-net/auth-server
npm install
```

2. Configure environment

```bash
cp env.example .env
# Fill in the values:
# AUTH_SECRET=... (random string)
# AUTH_PORT=3003
# FRONTEND_ORIGIN=http://localhost:5173
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...
```

3. Run the server

```bash
npm run dev
# Auth server running on http://localhost:3003
```

## Frontend Configuration

In `terra-spark-net/.env.local` (create if missing):

```
VITE_AUTH_BASE_URL=http://localhost:3003
```

The frontend uses cookies (with credentials) and will:
- GET `/session` to read the current user
- Redirect to `/auth/signin?provider=google` or `/auth/signin?provider=github`
- Redirect to `/auth/signout` to log out

## Notes
- Cookies are `SameSite=Lax`, `HttpOnly`, development `secure=false`.
- Adjust `FRONTEND_ORIGIN` if you change the Vite dev server URL.
- For production, serve over HTTPS and set `secure=true`.
