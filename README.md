# ClipHub Creator Signups API

Express.js API for receiving creator signups from the Discord bot and storing them in Supabase.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. In SQL Editor, run the queries from `setup.sql`
3. Get your credentials from Settings → API

### 3. Create .env

```bash
cp .env.example .env
```

Fill in:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role secret key
- `SIGNUP_WEBHOOK_SECRET` - Same secret as your Discord bot

### 4. Run Locally

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### 5. Deploy to justrunmyapp

1. Upload files to justrunmyapp
2. Set environment variables
3. justrunmyapp gives you a public URL
4. Update Discord bot's `SIGNUP_WEBHOOK_URL` with that URL

## Endpoints

**POST /api/creator/signup**
- Receives creator signups from Discord bot
- Requires `x-webhook-secret` header
- Saves to Supabase

**GET /api/creator/signups**
- List all creator signups
- Requires `x-webhook-secret` header

**GET /api/creator/signup/:discordId**
- Get specific creator by Discord ID
- Requires `x-webhook-secret` header

**GET /health**
- Health check endpoint
- No authentication required

## Database Schema

```
creator_signups
├── id (primary key)
├── discord_id (unique)
├── discord_username
├── discord_global_name
├── avatar_url
├── full_name
├── tiktok
├── youtube
├── instagram
├── email
├── wallet
├── bio
├── source
├── discord_submitted_at
├── created_at
└── updated_at
```
