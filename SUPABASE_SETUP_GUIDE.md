# Supabase Backend Setup & Manual Action Guide

This guide details all manual steps required in the **Supabase Dashboard** to complete your backend database setup.

---

## Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in or create an account.
2. Click **"New Project"**.
3. Fill in your project details:
   - **Name**: `Vectonix`
   - **Database Password**: Choose a strong password.
   - **Region**: Choose a region closest to your primary users (e.g. `Singapore / Mumbai`).
4. Click **"Create new project"** and wait 1–2 minutes for initialization.

---

## Step 2: Configure Environment Variables
In your project's local environment file (`.env.local`), add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

> **Where to find these**: Go to **Project Settings** -> **API** -> Copy `Project URL` and `anon public key`.

---

## Step 3: Run Database Migrations (SQL)
1. In the Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **"New Query"**.
3. Copy and paste the contents of `supabase/migrations/20260703000000_create_tables.sql`.
4. Click **"Run"** (Ctrl + Enter).

*This creates the `certificates`, `events`, `registrations`, and `profiles` tables, sets up RLS security policies, creates indexes, and configures storage buckets.*

---

## Step 4: Seed Initial Data
1. In **SQL Editor**, click **"New Query"**.
2. Copy and paste the contents of `supabase/seed_data.sql`.
3. Click **"Run"**.

*This imports all 18 existing student certificates into your Supabase database.*

---

## Step 5: Configure Storage Buckets
1. In Supabase Dashboard, go to **Storage**.
2. Verify that three public buckets are listed:
   - `signatures` (Public)
   - `events` (Public)
   - `documents` (Public)
3. If not created automatically, click **"New Bucket"**, name it, and check **"Public Bucket"**.

---

## Step 6: Enable Google OAuth Authentication (Optional)
If you wish to use Google Login with Supabase:
1. In Supabase Dashboard, go to **Authentication** -> **Providers** -> **Google**.
2. Enable Google provider.
3. Add your **Google Client ID** and **Client Secret** (from Google Cloud Console).
4. Add the Supabase Callback URL to your Google Cloud OAuth consent screen credentials.

---

## Architecture & Code Summary
- **Client**: `lib/supabase.ts` (Supabase JS SDK v2 client)
- **Services Layer**:
  - `lib/services/certificatesService.ts` (Certificates & Offer letters CRUD)
  - `lib/services/eventsService.ts` (Events CRUD)
  - `lib/services/responsesService.ts` (Registrations & Form responses)
  - `lib/services/storageService.ts` (File & Base64 uploads)
- **Authentication**: `lib/context/AuthContext.tsx`
