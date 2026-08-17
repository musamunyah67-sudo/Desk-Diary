# Desk Diary Website — What I Fixed & What You Need To Do Next

## ⚠️ Do this first — the site cannot work without it

1. **Get your real Supabase anon key.** Go to your Supabase project → Settings → API.
   Copy the **Project URL** and the **anon public** key, then paste them into `.env`:
   ```
   VITE_SUPABASE_URL=https://qoatnfgczjxhlbgwpomi.supabase.co
   VITE_SUPABASE_ANON_KEY=<paste the real anon key here>
   ```
   The version Devin shipped had the wrong URL (used the database host instead of the
   API host) and a **fabricated key** — literally your database password pasted into a
   fake token. It could never have worked.

2. **Create an unsigned Cloudinary upload preset.** In Cloudinary → Settings → Upload →
   Upload presets → Add upload preset → Signing Mode: **Unsigned**. Put its name into `.env`:
   ```
   VITE_CLOUDINARY_UPLOAD_PRESET=<your preset name>
   ```
   Devin's version hardcoded your actual Cloudinary account password directly into the
   frontend source code, which ships to every visitor's browser — anyone could have read
   it from the page source. **I'd recommend changing that Cloudinary password once this
   is deployed**, since the old code had it exposed.

3. **Run `supabase-schema.sql` in your Supabase SQL editor** (the whole file — it's safe
   to re-run, the new tables are appended at the end). This creates the tables for
   testimonials, volunteer resources, donation methods, sponsors/supporters, contact
   messages, and partnership/school inquiries, plus the role-management functions.

4. **Upload a FASOE logo.** Your zip included logos for ARC and ECO but not for Fassah
   Alies School of Excellence — I seeded the partner record with no image so the admin
   dashboard can have it uploaded once you have the file.

5. `npm install` then `npm run dev` to test locally (or your usual deploy step).

## What I found and fixed

**Broken from the start (blocking, not on your feature list):**
- Supabase client had an invalid URL + fake key → nothing could load or save (fixed)
- Cloudinary integration used the server-side SDK in browser code (wouldn't run) and
  leaked your real account password into client-side source (fixed — now uses safe
  unsigned uploads)
- Contact form and Partnership inquiry form didn't submit anywhere (fixed — now saved
  to `contact_messages` / `partnership_inquiries`, viewable in the admin Inbox tab)
- Partner school submission form on the Partners page didn't submit anywhere (fixed)
- Partnerships page listed three **fabricated sponsor organizations** that were never
  mentioned in your requirements (removed — now pulls real sponsors from the database,
  admin-managed)
- "Become a Partner" button did nothing (fixed — scrolls to the inquiry form)

**Your requirements that were missing, now implemented:**
- Admin dashboard previously only had real CRUD for Stories — News, Events, Gallery,
  Partners, Programs, Volunteer Opportunities, Volunteer Resources, Campaigns,
  Testimonials, Donation Methods, and Sponsors/Supporters are now fully manageable
  (add/edit/delete) from the dashboard
- Added an **Admins & Roles** tab so Admins/Superadmins can grant or revoke Admin /
  Superadmin access for existing accounts (only a Superadmin can grant Superadmin)
- Homepage stats, stories, upcoming events, testimonials ("What People Say"), and
  partner logos now pull live from the database instead of being hardcoded
- Programs page and its impact stats (media clubs, students trained, etc.) now pull
  from the database
- Volunteer page stats and "Volunteer Resources" section are now admin-managed
- Donate page donation methods and "Your Impact" stats are now admin-managed
- Contact page phone/email/address/socials now pull from Settings, and there's now a
  real embedded Google Map instead of a placeholder box
- Added the Hero 1–6 photos as a rotating hero carousel on the homepage (previously
  unused)
- Moved "The Core Team" photo to sit directly under its heading on the About page, and
  added the "lively" motion/animation styling to the Mission, Vision, Core Values, and
  Objectives cards
- Seeded the three named partners (FASOE, ARC, ECO Technical Institute)

## Note on user/role creation

Creating a brand-new login (not just promoting an existing account) now works from
inside the dashboard — **Admins & Roles → Create a Brand-New Login**. Behind the scenes
this calls a Supabase Edge Function (`supabase/functions/create-user`) that runs
server-side with the `service_role` key, which must never be shipped to the browser.
The function itself double-checks that whoever is calling it is already an Admin or
Superadmin before doing anything, so it can't be used to self-promote.

**To enable it, deploy the function once** (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):
```
supabase login
supabase link --project-ref qoatnfgczjxhlbgwpomi
supabase functions deploy create-user
```
No extra environment variables to set — Supabase automatically provides
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to every Edge
Function at runtime.

Two ways to use it from the dashboard:
- **Send an invite** (recommended) — the person gets an email link and sets their own
  password.
- **Set a temporary password yourself** — useful if they don't have easy email access
  yet; they can change it after logging in.

## Still worth a look

- I did not touch "Our Story," Mission/Vision copy, Core Values, or Objectives text —
  these read as fixed organizational identity content rather than things that need daily
  editing, so I left them as static text (with the lively animations you asked for)
  rather than wiring them into the CMS. Say the word if you'd like these editable too.
- I could not run a full production build in this environment (the sandbox's installed
  build tool was compiled for Windows, not Linux, and I have no network access to
  reinstall it), so I syntax-checked every file I touched instead. I'd recommend running
  `npm run build` yourself once you have the real Supabase key in place, just to be safe.
