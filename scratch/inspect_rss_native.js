const https = require('https');

https.get('https://techcrunch.com/category/artificial-intelligence/feed/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const itemMatch = data.match(/<item>([\s\S]*?)<\/item>/);
    if (itemMatch) {
      console.log('--- RSS ITEM PREVIEW ---');
      console.log(itemMatch[1]);
    } else {
      console.log('No item found');
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
