# Little Wings Play School

A responsive public website and secure admin workspace for Little Wings Play School in Madanapalle, Andhra Pradesh. The visual direction takes cues from the editorial pacing and clear school storytelling of the Josiah reference while using Little Wings’ own name, colours, school photos and content.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── logo.svg
│   └── images/                 # School photos moved from Downloads
├── src/
│   ├── App.jsx                 # Public pages and protected admin workspace
│   ├── content.jsx             # Default website copy and Supabase content provider
│   ├── main.jsx
│   ├── styles.css
│   └── supabase.js             # Supabase client; reads public env variables
├── private-reference/          # Photos kept out of the publicly served folder
└── supabase/
    └── migrations/             # Database schema and access policies
```

## Run the public site

Install Node.js, then run:

```bash
npm install
npm run dev
```

Build for publishing with `npm run build`. Vite writes the deployable site to `dist/`.

## Publish on GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and publishes the site whenever changes are pushed to `main`. It supports GitHub's repository-based Pages URL and keeps client-side routes such as `/visit` working on refresh.

1. Create a **public** GitHub repository for this project. The source code and files under `public/` will be visible to anyone.
2. Push this project to the repository's `main` branch.
3. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
4. Wait for the **Deploy to GitHub Pages** workflow to finish. GitHub will show the public website URL under **Settings → Pages**. Open that URL on another device to use the site.

The workflow builds the public site without Supabase configuration. The admin workspace and database-backed features remain unavailable until the school's Supabase project is configured; never add a Supabase service-role key to GitHub or the browser build. After configuring Supabase, set its URL and public anon key as GitHub Actions variables named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then add the deployed website URL to Supabase Auth's allowed redirect URLs.

`private-reference/`, `.env` files, `node_modules/`, and `dist/` are excluded from Git. Do not remove those protections or upload private photos, credentials, or real student/staff records to this public repository.

## Admin and database setup

The `/admin` route is prepared for Supabase Auth, Postgres, and private image storage. The public website works without Supabase; admin sign-in and database-backed changes remain disabled until a Supabase project is connected.

1. Create a Supabase project in the school’s own account.
2. Copy `.env.example` to `.env.local` and add the project URL and public anon key. Never put a service-role key in this website.
3. Run `supabase/migrations/202611130001_school_admin.sql`, then `supabase/migrations/202611130002_update_school_phone.sql` in Supabase SQL Editor.
4. Create `ggova70@gmail.com` in Supabase Auth with a strong, unique password. Never use a phone number as the admin password. In the Supabase SQL Editor, assign that account the private admin claim, then sign in again:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'ggova70@gmail.com';
   ```
5. Restart Vite. Visit `/admin` and sign in with that Supabase account. The admin workspace provides editable website copy with rich-text formatting (font family, size, color, emphasis, alignment and lists), extra pages/navigation tabs, events, homepage highlights, photo upload/reordering/removal, and private student/staff record screens.

The migration lets the public read only published events, highlights and photos. Student and staff tables are private to an administrator. Uploaded images are stored in a private bucket; new items begin as drafts. Admin authorization is enforced by database policies, not only by hiding controls in the browser.

Student records currently use only name, class and enrollment status; staff records use name, role and employment status. Expand these only after confirming the school’s actual workflow and the minimum necessary information. Do not put real student information into sample content or public pages.

## School details included

- Little Wings Play School and the “Play, Learn, Fly High!” identity
- Madanapalle address, school timings (9:30 AM–4:00 PM), and the provided Google Maps link
- Play Group, Nursery, LKG and UKG program labels
- A vector school emblem inspired by the supplied logo artwork
- A timed, manually controlled homepage photo slideshow and a separate click-to-enlarge photo gallery
- Classroom, activity-material, artwork and exterior photos moved into `public/images/`; photos known to show identifiable children or staff are kept in `private-reference/`

Some contact numbers and social account details were legible on the downloaded school banner and are used as provisional links. Verify these before publishing. Program descriptions and age ranges are general draft copy and should be replaced with the school's approved curriculum information.

## Photos and privacy

Photos containing identifiable children are not shown on the public website by default. Only publish a child’s photo after the school confirms appropriate parent/guardian permission. Admin uploads are private drafts until an administrator publishes them.

## Before publishing

- Add the approved logo file if the SVG emblem should be replaced by the original artwork.
- The school phone currently displays `8888888888`; update it in **Website copy** after signing in when the final number is available.
- Provide approved program descriptions, age ranges, teacher names and biographies, and current school highlights/events.
- The visit/enquiry form opens a prefilled email draft addressed to `ggova70@gmail.com` using the visitor's mail app. The visitor must press Send. Automatic delivery needs a server-side email provider and its credentials.
- Add a privacy notice and confirm applicable school and child-data requirements before collecting real records.
- Deploy the built `dist/` site to a static host and add the production domain to Supabase Auth’s allowed redirect URLs.
