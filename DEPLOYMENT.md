# Deployment Guide

This project is a Next.js 16 app with Supabase auth and server-side routes. The simplest production setup is:

- hosting: Vercel
- database/auth/storage: Supabase
- custom domain: attached in Vercel, with matching auth URLs in Supabase

`npm run build` succeeds locally, so the app is deployable once production environment variables and Supabase settings are in place.

## What I need from you

If you want me to handle the setup with you, I need:

1. A domain you already own, such as `tekswapp.com`
2. Access to the DNS settings for that domain, or for you to add the DNS records I give you
3. A Vercel account/project for this site
4. A Supabase project for production
5. The production environment variable values from `.env.example`

Do not paste secret keys into source control. Add them directly in Vercel project environment variables.

## Recommended launch flow

1. Push this repo to GitHub
2. Import the repo into Vercel
3. Add the production environment variables from `.env.example`
4. Run the SQL setup in [supabase/sql/profiles_and_storage.sql](supabase/sql/profiles_and_storage.sql)
5. Deploy the project
6. Attach your custom domain in Vercel
7. Update Supabase auth URLs to the live domain
8. Test login, dashboard access, and seller flows on the live site

## Vercel setup

Vercel is the best fit here because this app uses modern Next.js features, dynamic routes, and middleware/proxy behavior.

In Vercel:

1. Create a new project from this repository
2. Keep the framework preset as `Next.js`
3. Add the production variables from `.env.example`
4. Deploy

After the first deploy, Vercel will give you a public `.vercel.app` URL. That is enough for an initial public launch even before the custom domain is connected.

## Custom domain setup

In Vercel:

1. Open the project
2. Go to `Settings -> Domains`
3. Add your domain, for example `tekswapp.com`
4. Add `www.tekswapp.com` too if you want both versions
5. Copy the DNS records Vercel asks for
6. Add those records at your domain registrar or DNS provider

Important:

- Use the exact DNS records Vercel shows for your project
- Pick one canonical domain: either apex (`tekswapp.com`) or `www.tekswapp.com`
- Set a redirect so visitors always land on one version

Once DNS finishes propagating, Vercel will issue HTTPS automatically.

## Supabase production settings

Because this app uses Supabase auth and OAuth callback routes, the live domain must also be added in Supabase.

Update these values in the Supabase dashboard:

- `Authentication -> URL Configuration -> Site URL`
- `Authentication -> URL Configuration -> Redirect URLs`

Recommended values:

- Site URL: `https://yourdomain.com`
- Redirect URL: `https://yourdomain.com/auth/callback`
- Optional redirect URL: `https://www.yourdomain.com/auth/callback`
- Optional redirect URL: `https://yourdomain.com/auth`

If you use Vercel preview deployments, you can also add preview URLs there later.

## Required production environment variables

Set these in Vercel for Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `TEKSWAPP_OWNER_EMAILS`
- `TEKSWAPP_STAFF_EMAILS`

Optional:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` to your real live domain, for example:

- `https://tekswapp.com`

## What you can send me next

If you want me to walk you through the final setup, send:

- the domain name you want to use
- whether you want apex or `www` as the main domain
- whether you already have a Vercel account/project
- whether Supabase production is already created

If you want to do it yourself, follow this guide and I can sanity-check each step with you before you click anything.
