const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');
code = code.replace(/console\.log\([^)]*DEBUG[^)]*\);/g, '');
fs.writeFileSync('script.js', code);
console.log('Logs removed');
