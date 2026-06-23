# Deploy setup — mahoot.xyz

## 1. Database tables

Run migrations after deploying:

```bash
npm run sync:migrate
```

Creates `users`, `contributions`, `community_photos`, `elephant_overrides` (plus existing elephant tables).

## 2. Environment variables

Copy `.env.example` to `.env.local` (dev) or set in Hostinger Node app env (production).

| Variable | Production value |
|----------|------------------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://mahoot.xyz` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `ADMIN_EMAILS` | Your email (comma-separated for multiple admins) |
| `UPLOAD_DIR` | Persistent path **outside** the git deploy dir, e.g. `/home/.../private/uploads` |

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
