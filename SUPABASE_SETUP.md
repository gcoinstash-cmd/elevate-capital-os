# 💼 ELEVATE CAPITAL — 3-Minute Supabase Quickstart

This institutional system features a **Dual-Engine Architecture**. Out-of-the-box, it operates seamlessly using high-speed browser `localStorage`. To link your live Supabase cloud database, follow these 3 steps:

---

### Step 1: Create Your Supabase Project (1 min)
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Choose your preferred region and database password.

---

### Step 2: Execute SQL Migrations (1 min)
1. Navigate to the **SQL Editor** tab in your Supabase dashboard.
2. Open and copy the entire contents of `supabase/schema.sql` into the query editor, then click **RUN**.
3. (Optional) Run `supabase/seed.sql` to populate sample institutional investors, VDR files, and financial metrics.

---

### Step 3: Connect Frontend Environment Variables (1 min)
In your hosting environment (or local `.env`), declare:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### ✅ That's It!
Your ELEVATE CAPITAL instance is now connected to a high-concurrency PostgreSQL backend with Row-Level Security!
