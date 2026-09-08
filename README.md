# FlowAgent

Multi-service AI automation website with a white, blue and purple block-inspired design, editable admin panel, and server-rendered SEO.

Run with Node.js 20 or newer: `npm install` then `npm start`. Run checks with `npm test`.

See [RENDER-SETUP.md](RENDER-SETUP.md) for Render Free and Supabase Free deployment. Apply `supabase-schema.sql` before configuring the database environment variables. No paid disk is required. Free services may sleep or pause when inactive.

Manage content at `/admin`. Set private admin credentials and session secret in the hosting environment; never commit credentials, customer records, or runtime data. Existing exposed credentials must be replaced before publishing this update.

The public services include Social Media Manager alongside the existing catalogue. Generation, social publishing, and payment integrations require their own credentials and configuration; website deployment does not activate those services automatically.
