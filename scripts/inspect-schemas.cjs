const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  console.log(`\n=================== SCHEMA #${count} ===================`);
  try {
    const parsed = JSON.parse(match[1].trim());
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log(match[1].trim());
  }
}
