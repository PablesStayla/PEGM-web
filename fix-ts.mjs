import fs from 'node:fs';
import { globSync } from 'glob';

const files = globSync('**/package.json', { ignore: '**/node_modules/**' });
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('"typescript": "^5.9.3"')) {
    fs.writeFileSync(file, content.replace(/"typescript": "\^5\.9\.3"/g, '"typescript": "5.6.3"'));
  }
}
