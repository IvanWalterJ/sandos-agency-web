import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = path.join(process.cwd(), 'public', 'assets', 'why');

const FILES = [
  {
    name: 'why-1-experts.webp',
    url: 'https://www.agencefoudre.com/media/site/72a6fd87f0-1764595358/foudre-1-experts-600x-q80.webp',
  },
  {
    name: 'why-2-surmesure.webp',
    url: 'https://www.agencefoudre.com/media/site/7799a48da1-1764595519/foudre-2-surmesure-v2-600x-q80.webp',
  },
  {
    name: 'why-3-methode.webp',
    url: 'https://www.agencefoudre.com/media/site/41a1f3c09d-1764595371/foudre-3-methode-600x-q80.webp',
  },
  {
    name: 'why-4-humain.webp',
    url: 'https://www.agencefoudre.com/media/site/52fac380f5-1764595609/foudre-4-humain-v2-600x-q80.webp',
  },
];

fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const item of FILES) {
  const res = await fetch(item.url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${item.url}: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(TARGET_DIR, item.name);
  fs.writeFileSync(outPath, buf);
  console.log(`Saved ${item.name} (${buf.length} bytes)`);
}
