import fs from 'fs';
import path from 'path';

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') scan(p);
    } else if (p.endsWith('.jsx')) {
      const c = fs.readFileSync(p, 'utf8');
      const lines = c.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('.map(')) {
          for (let j = i; j < Math.min(lines.length, i + 8); j++) {
            if (lines[j].includes('key=')) {
              console.log(`${p}:${j+1}: ${lines[j].trim()}`);
              break;
            }
          }
        }
      });
    }
  }
}

scan('src');
