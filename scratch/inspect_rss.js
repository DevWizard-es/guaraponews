const axios = require('axios');

async function debugRSS() {
  try {
    const res = await axios.get('https://techcrunch.com/category/artificial-intelligence/feed/');
    const xml = res.data;
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
    if (itemMatch) {
      console.log('--- RSS ITEM PREVIEW ---');
      console.log(itemMatch[1]);
    } else {
      console.log('No item found');
    }
  } catch (e) {
    console.error('Error fetching RSS:', e.message);
  }
}

debugRSS();
