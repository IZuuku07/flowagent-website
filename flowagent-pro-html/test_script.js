const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const mock = 
const window = { location: { pathname: '/services' } };
const document = {
  getElementById: (id) => ({ id, innerHTML: '', addEventListener: () => {}, querySelector: () => ({}) }),
  querySelector: () => ({ innerHTML: '' }),
  addEventListener: () => {},
  body: { dataset: { page: 'services' } }
};
const fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ settings: {}, pageContent: {}, services: [{ slug: 'test', title: 'test', price: '99', description: 'test', benefits: ['test'], imageUrl: null }] }) });
;

fs.writeFileSync('test_script.js', mock + code);
console.log('Test file created');
