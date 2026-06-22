const fs = require('fs');
const path = '../GITHUB_UPLOAD_READY/data/public-content.json';
let store = JSON.parse(fs.readFileSync(path, 'utf8'));

store.services.forEach(svc => {
  if (svc.id === 'svc-wa-003') {
    svc.title = 'WhatsApp Chat Bot';
    svc.slug = 'whatsapp-chat-bot';
  }
});

fs.writeFileSync(path, JSON.stringify(store, null, 2));

const localPath = 'data/public-content.json';
fs.writeFileSync(localPath, JSON.stringify(store, null, 2));

console.log('Fixed whatsapp title');
