# FlowAgent website control API

Base URL after deployment: `https://flowagent.best/api/v1`

Configure a random secret of at least 32 characters in Render Environment as
`FLOWAGENT_WEBSITE_API_TOKEN`. Use a different value from admin, studio worker,
and blog-only publishing credentials. This API stays disabled until configured.
In n8n use Header Auth: `Authorization: Bearer <your secret>`.
Never put this token in frontend JavaScript, GitHub, URLs or workflow exports.

## What you can control

| Resource | Read | Write |
|---|---|---|
| `/content` | GET full public-content snapshot | Export/backup only |
| `/capabilities` | GET API capabilities | Read only |
| `/settings` | GET brand/contact/public payment-link settings | PATCH supplied fields |
| `/pages` | GET page copy | PATCH supplied pages and fields |
| `/pages/home` | GET homepage copy | PATCH supplied fields |
| `/seo` | GET SEO defaults and page metadata | PATCH supplied fields |
| `/services` | GET services | POST new service |
| `/pricing-plans` | GET plans | POST new plan |
| `/faqs` | GET FAQs | POST new FAQ |
| `/blog-posts` | GET published articles | POST approved article |
| `/testimonials` | GET testimonials | POST a real approved testimonial |
| `/case-studies` | GET case studies | POST a real approved case study |
| `/media` | GET media URL records | POST a media URL record |
| `/<collection>/<id>` | GET one item | PATCH supplied fields or DELETE item |

Page names: home, about, pricing, contact, faq, blog. GET first to inspect the
available field names. PATCH preserves all fields not supplied. SEO page patches
also preserve other routes and existing metadata. IDs from GET identify collection
items; slugs for services, case studies and blog articles must be unique.
Blog POST/PATCH requires `approved: true` and the existing article validation.
The separate `/api/publishing/batch` remains available with the blog-only key.

## Read, then update

Every content GET returns `{ "data": ..., "revision": "\"...\"" }` and an ETag
header. Send that revision **including its quote characters** as `If-Match` on
each write. This prevents overwriting a change made by admin or another workflow.
If you receive 412, read the latest content and review your patch before retrying.
Missing If-Match returns 428. Successful writes return the new revision.

Example homepage PATCH body:

```json
{"heroTitle":"Un assistant WhatsApp pour votre commerce."}
```

Example PATCH `/seo` body:

```json
{"pages":{"/pricing":{"title":"Tarifs | FlowAgent","description":"Découvrez nos services et demandez un devis adapté à votre activité."}}}
```

Example PATCH `/services/<id>` body:

```json
{"price":"400 DH / mois","description":"Un assistant adapté aux informations validées de votre commerce."}
```

In n8n: GET the target resource → inspect `data` → PATCH the same URL with your
JSON body and `If-Match: {{ $('Read Website Resource').first().json.revision }}`.
The included `automation/n8n-Website-Control.json` is an inactive template:
edit its target resource and patch, review with dryRun=true, then set dryRun=false.
No secrets are included. Keep automated deletion disabled unless intended.

## Persistence and limits

Changes use the existing Supabase public document, remain after source deployments,
and refresh the public cache immediately. Private leads, orders, bookings, bank
details, passwords and server configuration are outside this API. GET `/content`
is suitable for a public-content backup before edits/deletion. DELETE has no
automatic undo; restore a record by POSTing its saved fields without its ID.

This controls content, not source code, CSS, deployment, DNS or Render settings.
Media endpoints register existing hosted image URLs; they do not upload files.
The existing single-server mutation queue serializes writes; multi-instance
hosting requires a database-level concurrency mechanism before scaling.

401 = invalid key; 503 = unconfigured API or unavailable storage; 400 = invalid
input; 404 = unknown item; 409 = duplicate slug; 412 = changed revision.
No production deployment or token configuration is implied by this source file.
