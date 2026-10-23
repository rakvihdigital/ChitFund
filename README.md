# RAKVIH Chit Fund

Next.js app backed by Supabase Auth, Postgres, Row Level Security, and private KYC storage.

## Supabase setup

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and in the deployment environment. Use only the public key in these variables.
2. On a new Supabase project, apply [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor. On the existing project, do not rerun this file because it creates types and tables.
3. Apply [`supabase/migrations/20261023_live_integration.sql`](supabase/migrations/20261023_live_integration.sql) in the SQL Editor. It seeds the two official schemes and adds the group count, installment, staff enrollment, auction finalization, and maker approval functions.
4. Create a real user through Supabase Auth. Promote the intended administrator in the SQL Editor:

   ```sql
   UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'your-admin@example.com';
   ```

   Never put a service role key in a `NEXT_PUBLIC_` variable or browser code.

5. Set the Supabase Auth site URL and redirect URLs to the actual deployed app origin so email confirmation returns to the app.

## Run

```bash
npm install
npm run dev
```

`npx next build --webpack` builds this project in environments where Turbopack cannot bind a local port for CSS processing.

## Current operational limits

Online payment is disabled until a payment gateway and verified webhook are configured. The app does not create successful payments or receipts from a browser click. Checker release is disabled until a bank transfer confirmation workflow is implemented. KYC requires a PAN document and Aadhaar document, uploaded to the private Supabase bucket; only the last four Aadhaar digits are stored in Postgres.
