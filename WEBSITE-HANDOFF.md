# FlowAgent website update

The website keeps its service catalogue and white, blue and purple visual style. The Social Media Manager is an additional service.

## Edit the website

Open /admin on the running website and use your existing admin username and password. Choose Page content, Services, Pricing, Blog, Images, FAQs, Search & sharing, or Brand & payments. Save to update the running website. Enquiries and orders are in separate sections. Use Account to change your password.

The administration panel needs the Node server and durable storage. The selected no-cost setup is Render Free with Supabase Free: see RENDER-SETUP.md. Do not enable a paid Render disk. GitHub stores source code; GitHub Pages alone cannot run the editing APIs. Until Supabase is connected, local file edits on Render Free are temporary.

## PayPal

The account email is aamr.agdal@gmail.com. The old unverified paypal.me/flowagent links were removed. An email alone does not connect automatic checkout. Configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET privately on the hosting server, test with sandbox credentials, then use live credentials and PAYPAL_ENVIRONMENT=live. No real payment has been made or verified in this update.

## Launch configuration

Keep your existing private configuration and credentials outside GitHub. Configure ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_ITERATIONS and SESSION_SECRET on your server if no private server-config.json exists. Keep FLOWAGENT_LOCAL_STUDIO=0 in production. Configure BASE_URL=https://flowagent.best, the required hosting PORT, and the appropriate HOST for your provider.

Use npm start on Render Free after configuring the Supabase connection. Restart after code changes. The admin is at /admin; robots and sitemap are at /robots.txt and /sitemap.xml. Submit the sitemap in your own Google Search Console account once the updated site is live.

## What was checked

Isolated-server tests cover login, unauthorized access, content edits reflected in HTML, SEO edits, preservation of service metadata, PayPal-email persistence, canonical sitemap links, unknown service 404s and private-file access restrictions. Static UI checks cover admin navigation targets, populated editors and one active panel. No live customer forms, paid API calls or PayPal transactions were submitted.

## Research informing this update

- https://www.morningside.ai/ — clear service progression from identifying work to implementation and adoption.
- https://www.axeautomation.co/ — concrete services, an obvious enquiry route and visible evidence. Their published results are their own claims, not independently verified here.
- https://focalfrog.com/service/ai-automation — dedicated automation service content and tool-specific relevance.
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide — descriptive titles, useful page content and crawlable links.
- https://developer.paypal.com/platforms/checkout/standard/integrate — server-side checkout credentials and sandbox testing.

FlowAgent uses original wording. Competitors' testimonials, customer logos and performance claims were not copied. Search positions and sales are not guaranteed by a design update.
