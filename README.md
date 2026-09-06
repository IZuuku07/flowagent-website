# FlowAgent Business Website

FlowAgent is a multi-page AI agency website with:

- public marketing pages
- individual service pages
- blog and SEO content structure
- contact, quote, booking, and newsletter capture
- secure admin login
- admin dashboard for editing content
- file-based persistent storage
- payment link support for card, PayPal, and bank transfer details
- deployment-ready Node server

## What is included

Public pages:

- `/`
- `/services`
- `/services/ai-video`
- `/services/ai-automation`
- `/services/rag-chatbot`
- `/services/social-media-automation`
- `/services/lead-generation`
- `/services/custom-ai-agents`
- `/about`
- `/pricing`
- `/case-studies`
- `/testimonials`
- `/blog`
- `/blog/<slug>`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`
- `/payment-success`
- `/payment-cancel`

Admin:

- `/admin`

## Files that matter most

- [server.js](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\server.js)
- [server-config.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\server-config.json)
- [data/store.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\data\store.json)
- [script.js](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\script.js)
- [styles.css](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\styles.css)

## Local setup

1. Open PowerShell in this folder:
   `C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows`
2. Run:
   `npm.cmd start`
3. Open:
   `http://localhost:3000`

## Admin login

Admin URL:

- `http://localhost:3000/admin`

Default login:

- username: `admin`
- password: `change-me-flowagent`

Important:

- change the password after first login
- also replace the session secret in [server-config.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\server-config.json)

## Where you control the website

Log in at `/admin`.

From there you can manage:

- site settings
- homepage/page copy
- services
- pricing plans
- testimonials
- case studies
- FAQ items
- blog posts
- media links
- leads
- bookings
- newsletter subscribers
- SEO defaults
- admin password

## How content works

The website content is stored in:

- [data/store.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\data\store.json)

You normally should edit it through the admin dashboard, not directly in the JSON file.

## Payments

This project is structured for payment-ready operation using links.

Current setup:

- card checkout link field
- PayPal link field
- bank transfer details section
- payment success page
- payment cancel page

Where to add payment details:

- log in to `/admin`
- open `Site Settings`
- add:
  - general Stripe/card link
  - general PayPal link
  - bank details
- for service-specific or plan-specific checkout links:
  - use the `Services` and `Pricing` forms

Current limitation:

- this version uses hosted payment links, not direct Stripe server-side checkout sessions
- that keeps setup simple, but payment confirmations are not yet automatically written back into the dashboard

## Forms included

The website stores these requests:

- contact requests
- quote requests
- consultation bookings
- newsletter signups

Where they go:

- leads appear in the admin dashboard
- bookings appear in the admin dashboard
- newsletter emails appear in the admin dashboard

Email notifications:

- contact, booking, quote, and newsletter forms can send email notifications through Web3Forms
- set `WEB3FORMS_ACCESS_KEY` or `WEB3FORMS_KEY` in your hosting environment, or set `web3FormsAccessKey` in `server-config.json`
- if the Node form API is unavailable, the browser falls back to the public Web3Forms integration in `script.js`

## SEO included

- semantic HTML structure
- meta titles and descriptions
- blog architecture
- clean URLs
- `robots.txt`
- `sitemap.xml`
- editable SEO defaults in admin

## Going online

This app can be deployed to any Node-capable host.

Simple options:

1. Railway
2. Render
3. VPS
4. AWS EC2 / Lightsail
5. Docker-capable platform

### Easiest deployment path

Use a host that runs Node apps with persistent disk access.

Basic deploy steps:

1. Upload this project to GitHub.
2. Create a new app on your hosting platform.
3. Connect the GitHub repo.
4. Set the start command to:
   `npm start`
5. Make sure port `3000` is allowed or mapped by the host.
6. Set your domain to point to that host.

## Environment / config notes

This project uses:

- [server-config.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\server-config.json)

Before going live, replace:

- `sessionSecret`
- default admin password hash by changing password in admin
- `stripePublishableKey`
- `stripeSecretKey`
- `paypalClientId`
- `baseUrl`

Also update:

- business email
- WhatsApp number
- booking link
- bank details
- payment links
- legal pages

## AWS note

If you want AWS:

- use EC2 or Lightsail for the Node server
- store this project on the instance
- run it with a process manager later such as PM2 or a service unit
- put Nginx or CloudFront in front if needed
- use Route 53 for domain DNS if you want AWS-managed domains

## Security notes

This version includes:

- admin authentication
- session cookie login
- hashed admin password in config
- protected admin data routes
- server-side form saving

Still recommended before real production:

- HTTPS in production
- stronger secret rotation
- regular backups of `data/store.json`
- real payment webhook handling
- database upgrade if you want multi-admin or heavier scale

## Best next upgrades

If you want the next production layer after this, build:

1. real database instead of file storage
2. direct Stripe checkout sessions + webhooks
3. email notifications for new leads
4. calendar integration for bookings
5. image upload pipeline instead of URL-only media
6. role-based admin users
7. deployment automation

## Separate extra file

This project also still contains your earlier Shopify blog workflow starter:

- [shopify-daily-blog-workflow.json](C:\Users\Jotar\Documents\Codex\2026-04-23-can-you-build-n8n-workflows\shopify-daily-blog-workflow.json)
