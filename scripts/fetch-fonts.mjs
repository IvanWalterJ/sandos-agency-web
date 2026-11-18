import fs from 'node:fs/promises';
import path from 'node:path';

const fontsDir = path.join(process.cwd(), 'public', 'fonts');

async function run() {
  await fs.mkdir(fontsDir, { recursive: true });

  const htmlRes = await fetch('https://www.agencefoudre.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  const html = await htmlRes.text();

  const fontUrls = new Set();
  for (const m of html.matchAll(/(?:href|src)=["']?([^"'\s>]*\.woff2?)/gi)) {
    fontUrls.add(new URL(m[1], 'https://www.agencefoudre.com/').toString());
  }

  for (const m of html.matchAll(/(?:href|src)=["']?([^"'\s>]*\.css[^"'\s>]*)/gi)) {
    const absCss = new URL(m[1], 'https://www.agencefoudre.com/').toString();
    const cssRes = await fetch(absCss, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!cssRes.ok) continue;
    const css = await cssRes.text();
    for (const fm of css.matchAll(/url\((['"]?)([^'")\s]+\.woff2?)\1\)/gi)) {
      fontUrls.add(new URL(fm[2], absCss).toString());
    }
  }

  console.log('Found fonts:', [...fontUrls]);
  if (fontUrls.size === 0) throw new Error('No font URLs found');

  for (const u of fontUrls) {
    const name = path.basename(new URL(u).pathname);
    const res = await fetch(u, { headers: { Referer: 'https://www.agencefoudre.com/' } });
    if (!res.ok) {
      console.error('FAIL', name, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(path.join(fontsDir, name), buf);
    console.log(`OK ${name} (${buf.length} bytes)`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
