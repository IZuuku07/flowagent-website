const fs = require('fs');

// 1. Fix script.js
let code = fs.readFileSync('script.js', 'utf8');
if (!code.includes('function serviceLink')) {
  code = code.replace('function renderServicesPage(data) {', 'function serviceLink(service) {\n  return /services/\;\n}\n\nfunction renderServicesPage(data) {');
  fs.writeFileSync('script.js', code);
  fs.writeFileSync('../GITHUB_UPLOAD_READY/script.js', code);
  console.log('Fixed script.js');
}

// 2. Fix public-content.json
let store = JSON.parse(fs.readFileSync('data/public-content.json', 'utf8'));

store.services.forEach(svc => {
  svc.price = '/month';
  if (svc.id === 'svc-ugc-002') {
    svc.title = 'Social Media Automation';
    svc.slug = 'social-media-automation';
    svc.description = 'Automated social media content generated and published directly to your brand accounts.';
  }
  if (svc.id === 'svc-whatsapp-003') {
    svc.title = 'WhatsApp Chat Bot';
    svc.slug = 'whatsapp-chat-bot';
  }
});

store.pricingPlans.forEach(plan => {
  plan.price = '/month';
  if (plan.id === 'plan-ugc-002') {
    plan.name = 'Social Media Engine';
  }
});

fs.writeFileSync('data/public-content.json', JSON.stringify(store, null, 2));
fs.writeFileSync('../GITHUB_UPLOAD_READY/data/public-content.json', JSON.stringify(store, null, 2));
console.log('Fixed public-content.json');

