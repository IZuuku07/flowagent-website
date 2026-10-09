# FlowAgent publishing API

This API publishes reviewed blog articles from n8n without website-admin login.
It does not provide access to leads, payments, credentials or website settings.

1. Deploy this source to GitHub `main` and wait for Render to finish.
2. Configure `FLOWAGENT_PUBLISH_TOKEN` in Render Environment with a random secret
   of at least 32 characters. The API stays disabled when this is not configured.
3. Create an n8n **Header Auth** credential named **FlowAgent Publishing API**:
   header `Authorization`, value `Bearer <the same secret>`.
4. Import `n8n-Blog-Publisher.json`, select that credential on all HTTP nodes,
   and run the manual trigger after verifying the approved library.
5. The manual run publishes up to 100 unpublished articles. The daily schedule
   publishes up to 3 remaining articles at 09:00 Africa/Casablanca.
   Run the manual trigger first to publish the linked library together, then
   activate the schedule. A batch with links to missing articles is rejected.

## Routes

- `GET /api/publishing/library`: approved source articles from the deployment's
  `data/approved-blog-posts.json`. Drafts without `approved: true` are excluded.
- `GET /api/publishing/posts`: IDs and slugs already published.
- `POST /api/publishing/posts`: publish or update one approved article by slug.
- `POST /api/publishing/batch`: publish 1–100 approved articles in one write.
  Every article and internal blog link is validated before the stored document
  changes. The body is `{ "posts": [ ...articles ] }`.

POST accepts `slug`, `title`, `excerpt`, `category`, `tags`, `author`, `language`,
`publishedAt`, `metaDescription`, `contentHtml`, `editorialDisclosure`, and
`approved: true`. Languages are `en`, `fr`, and `ar`. Publication dates use
`YYYY-MM-DD`. Article HTML is restricted to simple headings, paragraphs, lists,
emphasis and safe links. Articles shorter than 300 words are rejected.

Repeated identical submissions return `action: unchanged`; they do not duplicate
the article or change its original publication date. Changes to an existing slug
return `action: updated`. A new slug returns HTTP 201 and `action: created`.
The n8n workflow skips existing slugs to preserve owner edits.

## Persistence and deployment

Published articles use the existing public document in Supabase. A source
deployment does not replace the stored content. The approved library is separate
from published posts; n8n explicitly publishes it through this API. The workflow
must use one publisher against the existing single-app deployment. Article writes
share the website's existing serialized mutation queue.

Secrets belong in Render Environment and n8n Credentials, never in GitHub or the
workflow export. No secret is bundled in this source. This code does not change
the FlowAgent platform, Larmen, or any WhatsApp workflow.

## SEO and review

Article pages include a canonical URL, a unique description, BlogPosting schema,
language, byline and editorial disclosure. Internal links are preserved and each
published slug appears in the sitemap. Articles should remain relevant, useful
and reviewed; quantity and keyword repetition do not guarantee search traffic.

The existing Google verification tag is preserved. Render Free cold starts can
still affect first requests; code checks alone cannot certify Search Console
fetching or indexing. Review Search Console after the deployment is live.
