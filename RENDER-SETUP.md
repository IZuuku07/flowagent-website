# Free deployment: Render Free + Supabase Free

Do not upgrade Render or add a paid disk. Keep the existing flowagent.best web service on its Free plan.

1. Create a Supabase project in a Free organization. Do not add payment details or upgrade. Run supabase-schema.sql in that project's SQL editor. The table denies anonymous and browser-user access; only the server key can read it.
2. In Render, privately configure SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY). Never put a server key in GitHub, frontend code or screenshots.
3. Configure HOST=0.0.0.0, BASE_URL=https://flowagent.best and FLOWAGENT_LOCAL_STUDIO=0. Leave FLOWAGENT_DATA_DIR unset. Use npm install --omit=dev for build and npm start for start.
4. Configure fresh admin credentials and SESSION_SECRET privately before removing the exposed server-config.json. Do not reuse the publicly exposed secret. Deploy the prepared update only after credentials and database access are ready.
5. On first start, public content is seeded only if the database has no website document. Existing edits are never replaced by the repository seed. Private records, account settings and studio drafts are also saved to the database. Existing local/private production records are not automatically migrated; copy them deliberately if needed before switching.
6. Verify /admin says Database connected. Save a test edit, restart the Render service, and verify it survives before treating the deployment as complete.

Free services have limits: Render can sleep after inactivity, and a Supabase Free project can be paused after inactivity. If database access fails, saving fails visibly instead of pretending that temporary files are durable. This implementation does not purchase plans, create database accounts, keep free services artificially awake or make paid AI calls automatically.
