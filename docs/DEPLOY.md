# Deploy setup — mahoot.xyz

## 1. Database tables

Run migrations after deploying:

```bash
npm run sync:migrate
```

Creates `users`, `contributions`, `community_photos`, `elephant_overrides` (plus existing elephant tables).

## 2. Environment variables (hPanel — recommended)

**Yes — you can import env in hPanel.** This is the preferred approach; you do not need to bundle `.env.production` in deploy zips.

1. **hPanel** → **Websites** → **mahoot.xyz** → **Deployments** → **Settings & Redeploy**
2. Scroll to **Environment variables**
3. Click **Import .env** and either upload or **paste** the contents of your local `.env.production`
4. Click **Save** and **Redeploy** (env changes only apply after a rebuild)

Use [`.env.hostinger.example`](.env.hostinger.example) as a checklist. Copy real values from your local `.env.production` (gitignored).

| Variable | Production value |
|----------|------------------|
| `MYSQL_HOST` | e.g. `srv1529.hstgr.io` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | From hPanel → Databases |
| `MYSQL_USER` | From hPanel → Databases |
| `MYSQL_PASSWORD` | From hPanel → Databases |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Same as `AUTH_SECRET` |
| `AUTH_URL` | `https://mahoot.xyz` |
| `NEXTAUTH_URL` | `https://mahoot.xyz` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (optional) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (optional) |
| `ADMIN_EMAILS` | Your email (comma-separated for multiple admins) |
| `UPLOAD_DIR` | `/home/u196551923/domains/mahoot.xyz/private/uploads` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | (Optional) e.g. `mahoot.xyz` — set **before** build |
| `ERROR_WEBHOOK_URL` | (Optional) Webhook for server errors |

`NEXT_PUBLIC_*` vars must be present **before** `npm run build` on the server.

### Optional: bundle env in deploy zip

If you deploy via MCP/CLI instead of hPanel import:

```bash
chmod +x scripts/deploy-hostinger.sh
./scripts/deploy-hostinger.sh /tmp/mahoot-deploy.zip
```

This adds your local `.env.production` to the archive. Prefer hPanel import so secrets stay out of deploy artifacts.

## 3. Google OAuth

1. Create OAuth 2.0 Client ID (Web application) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Authorized JavaScript origins: `https://mahoot.xyz`
3. Authorized redirect URIs:
   - `https://mahoot.xyz/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (dev)

## 4. Uploads on Hostinger Node

- Set `UPLOAD_DIR` to a directory that survives redeploys (not inside the release checkout).
- Files are served at `https://mahoot.xyz/api/uploads/...` via the streaming route.
- Ensure the Node process user can read/write `UPLOAD_DIR`.

## 5. DNS & SSL

Point `mahoot.xyz` (and `www`) to the Hostinger Node app and enable SSL in hPanel so `AUTH_URL` matches the live origin.

## 6. First admin

Add your email to `ADMIN_EMAILS` before first sign-in, or sign up then update `users.role` to `admin` in MySQL.

## 7. Moderation workflow

1. User signs in → submits photo or info edit on an elephant profile.
2. Submission appears at `/admin/contributions` (admin/moderator only).
3. Approve → photo goes to `community_photos` or fields merge into `elephant_overrides`.
4. Weekly elephant.se sync does **not** overwrite community data.
