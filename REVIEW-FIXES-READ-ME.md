# Follow-up fixes for the September 12 upload

This update is based on GitHub main commit `096fff3`, not the older local checkout.

## Confirmed and fixed

- The uploaded contact form was missing `<option>` before `Under 100`. All five choices now render correctly.
- `readPublicContent()` never invoked `content-upgrade.cjs`. Old content persisted even with the new renderer deployed. It now upgrades matching old defaults on read, preserving owner edits and removed services. An HTTP regression test covers this exact failure.
- Services now have Search title and Search description inputs in admin. They save through the API and feed server-rendered metadata. Explicit page overrides in Search & sharing retain priority; the service editor explains this.
- The default hero now says “Stop answering the same WhatsApp questions all day.” WhatsApp AI and Lead automation have direct navigation links. The illustrative demo disclosure remains.
- Public marketing pages have a Content Security Policy. Admin and checkout keep their existing behavior; this is not a claim of a site-wide CSP rollout. The obsolete X-XSS-Protection header is removed.
- `/api/health` returns a public version marker and, on Render, the deployed commit hash. It reports process availability, not database or payment readiness. The expected version is `2026-09-12-review-2`.
- Unreferenced numbered upload duplicates, misplaced root test copies and old fix/patch scripts were removed from this source branch (32 files). Updated tests are restored under `tests/`. Existing assets and working legacy route handling remain.

No prices, paid services, founder identity, client results, social profiles or geographic coverage were invented.

## Publish without flattening the folders

GitHub authentication is still unavailable in this session, so these changes are not pushed.

Extract `FLOWAGENT_REVIEW_FIXED.zip`. In GitHub's upload page, drag the extracted files AND folders into the repository root. Preserve `data/`, `tests/`, `media/` and `blog/`; do not move their contents into the root or upload the ZIP itself. Keep Render's existing environment variables.

An upload replaces matching files but does not delete old files in GitHub. To apply the cleanup as well, use the supplied `FLOWAGENT_REVIEW_FIXES.patch` in a clean checkout of main:

```sh
git apply --check FLOWAGENT_REVIEW_FIXES.patch
git apply --index FLOWAGENT_REVIEW_FIXES.patch
git commit -m "Fix saved content upgrade, service SEO and upload duplicates"
git push origin main
```

If the check reports a conflict, do not force it; the patch must be reconciled with newer changes. GitHub history retains the removed files.

On Render, confirm the branch is `main` and start command is `npm start` or `node server.js`. After deployment, open `https://flowagent.best/api/health`: version should be `2026-09-12-review-2` and commit should match GitHub's deployed commit. Then check the homepage and contact form.

## Verification

14 automated tests pass, including raw HTML checks across the marketing/service/blog routes, admin updates, service SEO persistence, saved legacy content migration, valid contact options, CSP headers, audit validation and storage. Browser checks at 1440, 1024, 900 and 390 pixels found no horizontal overflow. Mobile navigation and the three demo scenarios work with the marketing CSP enabled. A missing favicon request found in the browser check was addressed by adding the existing logo as favicon where absent.

The live service page already returned readable HTML when checked in this session. The live homepage still had old copy. The confirmed content migration bug explains that discrepancy; this session did not verify Render dashboard settings or its current deployed commit.

Search Console submission, analytics IDs and real case-study material remain account/material-dependent follow-ups from the previous handoff.
