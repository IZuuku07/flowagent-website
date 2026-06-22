const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'GITHUB_UPLOAD_READY', 'data', 'public-content.json');
const store = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// ============================================================
// FIX 1: All prices say "/month" instead of "$99/month"
// (PowerShell ate the "$99" during variable interpolation)
// ============================================================
store.services.forEach(svc => {
  if (svc.price === '/month' || svc.price === '') {
    svc.price = '$99/month';
  }
});
store.pricingPlans.forEach(plan => {
  if (plan.price === '/month' || plan.price === '') {
    plan.price = '$99/month';
  }
});
console.log('[FIX 1] All prices set to $99/month');

// ============================================================
// FIX 2: Hero title has typo "Buissnes" → "Business"
// ============================================================
if (store.pageContent.home.heroTitle.includes('Buissnes')) {
  store.pageContent.home.heroTitle = 'Turn Your Business Into an Automated Growth Engine';
  console.log('[FIX 2] Fixed hero title typo: Buissnes → Business');
}

// ============================================================
// FIX 3: Two ghost services with empty titles (GUID IDs)
// Make sure they stay marked as legacy so they don't show
// ============================================================
store.services.forEach(svc => {
  if (!svc.title || svc.title.trim() === '') {
    svc.legacy = true;
    console.log(`[FIX 3] Ghost service ${svc.id} kept as legacy (hidden)`);
  }
});

// ============================================================
// FIX 4: Duplicate "Social Media Automation" slug
// svc-ugc-002 and svc-social-media-automation both have slug "social-media-automation"
// Fix the legacy one to avoid routing conflicts
// ============================================================
const slugCounts = {};
store.services.forEach(svc => {
  if (svc.slug) {
    slugCounts[svc.slug] = (slugCounts[svc.slug] || 0) + 1;
  }
});
Object.entries(slugCounts).forEach(([slug, count]) => {
  if (count > 1) {
    console.log(`[FIX 4] Duplicate slug "${slug}" found ${count} times`);
  }
});

// ============================================================
// FIX 5: Ensure "Book a Call" in header links to /pricing (which has the booking form)
// Currently bookingLink is "/contact" — keep that as is (it's reasonable)
// ============================================================
console.log(`[INFO] bookingLink = "${store.settings.bookingLink}" (OK)`);

// ============================================================
// WRITE BACK
// ============================================================
fs.writeFileSync(jsonPath, JSON.stringify(store, null, 2));
console.log('\n[DONE] public-content.json updated and saved.');

// Also copy to the source directory
const srcPath = path.join(__dirname, 'data', 'public-content.json');
if (fs.existsSync(path.dirname(srcPath))) {
  fs.writeFileSync(srcPath, JSON.stringify(store, null, 2));
  console.log('[DONE] Also updated source data/public-content.json');
}

// ============================================================
// VERIFY
// ============================================================
console.log('\n--- VERIFICATION ---');
const activeServices = store.services.filter(s => !s.legacy);
console.log(`Active services: ${activeServices.length}`);
activeServices.forEach(s => console.log(`  ${s.id}: "${s.title}" @ ${s.price}`));
console.log(`Pricing plans: ${store.pricingPlans.length}`);
store.pricingPlans.forEach(p => console.log(`  ${p.id}: "${p.name}" @ ${p.price}`));
console.log(`Hero title: "${store.pageContent.home.heroTitle}"`);
