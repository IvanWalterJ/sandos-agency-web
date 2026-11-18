import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const AI_PATH = path.join(ROOT, 'Identidad visual.ai');
const OUT_ASSETS = path.join(ROOT, 'public', 'assets');
const OUT_MODULE = path.join(ROOT, 'src', 'data', 'sandosBrandVectors.js');

function readDecompressedStream(buf, str, targetIndex) {
  const streamRegex = /<<(.*?)>>\s*stream\r?\n/gs;
  let match;
  let idx = 0;
  while ((match = streamRegex.exec(str)) !== null) {
    const dict = match[1];
    const start = match.index + match[0].length;
    const end = str.indexOf('endstream', start);
    if (end === -1) break;
    if (idx === targetIndex) {
      let raw = buf.subarray(start, end);
      if (raw[raw.length - 1] === 0x0a) raw = raw.subarray(0, raw.length - 1);
      if (raw[raw.length - 1] === 0x0d) raw = raw.subarray(0, raw.length - 1);
      if (!dict.includes('/FlateDecode')) {
        throw new Error(`Stream ${targetIndex} is not FlateDecode`);
      }
      return zlib.inflateSync(raw).toString('latin1');
    }
    idx += 1;
  }
  throw new Error(`Stream ${targetIndex} not found`);
}

function pdfGroupToSvgPath(block) {
  const cmMatch = block.match(/1 0 0 1 ([\d.-]+) ([\d.-]+) cm/);
  if (!cmMatch) return null;
  const tx = Number.parseFloat(cmMatch[1]);
  const ty = Number.parseFloat(cmMatch[2]);
  const lines = block.split(/\r?\n/);

  let d = '';
  let cx = 0;
  let cy = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const pt = (x, y) => {
    const X = Number((tx + x).toFixed(2));
    const Y = Number((1080 - (ty + y)).toFixed(2));
    if (X < minX) minX = X;
    if (X > maxX) maxX = X;
    if (Y < minY) minY = Y;
    if (Y > maxY) maxY = Y;
    return `${X} ${Y}`;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const op = parts[parts.length - 1];
    const nums = parts.slice(0, -1).map(Number);
    if (op === 'm') {
      cx = nums[0];
      cy = nums[1];
      d += `M${pt(cx, cy)} `;
    } else if (op === 'l') {
      cx = nums[0];
      cy = nums[1];
      d += `L${pt(cx, cy)} `;
    } else if (op === 'c') {
      cx = nums[4];
      cy = nums[5];
      d += `C${pt(nums[0], nums[1])} ${pt(nums[2], nums[3])} ${pt(nums[4], nums[5])} `;
    } else if (op === 'y') {
      cx = nums[2];
      cy = nums[3];
      d += `C${pt(nums[0], nums[1])} ${pt(nums[2], nums[3])} ${pt(nums[2], nums[3])} `;
    } else if (op === 'v') {
      d += `C${pt(cx, cy)} ${pt(nums[0], nums[1])} ${pt(nums[2], nums[3])} `;
      cx = nums[2];
      cy = nums[3];
    } else if (op === 'h') {
      d += 'Z ';
    } else if (op === 'f' || op === 'f*') {
      if (!d.trim().endsWith('Z')) {
        d += 'Z ';
      }
    }
  }

  return {
    d: d.trim(),
    bbox: { minX, minY, maxX, maxY },
  };
}

function makeS2Svg(sFill, twoFill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="300 265 480 565" fill="none">
  <path d="${sPath}" fill="${sFill}" fill-rule="evenodd"/>
  <path d="${twoPath}" fill="${twoFill}" fill-rule="evenodd"/>
</svg>
`;
}

const aiBuffer = fs.readFileSync(AI_PATH);
const aiStr = aiBuffer.toString('latin1');

// STREAM 41: Official large centered S2 isotipo (Bicolor Yellow + Magenta)
const stream41 = readDecompressedStream(aiBuffer, aiStr, 41);
const s2Groups = stream41.split(/q 1 0 0 1 /).slice(1).map((g) => `q 1 0 0 1 ${g.split('Q')[0]}`);
if (s2Groups.length < 2) {
  throw new Error('Expected 2 paths in STREAM 41 for S2 isotipo');
}
const twoObj = pdfGroupToSvgPath(s2Groups[0]);
const sObj = pdfGroupToSvgPath(s2Groups[1]);
const sPath = sObj.d;
const twoPath = twoObj.d;

// STREAM 79: Official full Lockup (S2 isotipo + SANDOS custom wordmark)
const stream79 = readDecompressedStream(aiBuffer, aiStr, 79);
const lockupGroups = stream79
  .split(/q 1 0 0 1 /)
  .slice(1)
  .map((g) => `q 1 0 0 1 ${g.split('Q')[0]}`);
if (lockupGroups.length < 8) {
  throw new Error(`Expected 8 groups in STREAM 79, got ${lockupGroups.length}`);
}

const lockupTwo = pdfGroupToSvgPath(lockupGroups[0]);
const lockupS = pdfGroupToSvgPath(lockupGroups[1]);
const wordmarkLettersRaw = lockupGroups
  .slice(2, 8)
  .map((g) => pdfGroupToSvgPath(g))
  .sort((a, b) => a.bbox.minX - b.bbox.minX);

const letterNames = ['S', 'A', 'N', 'D', 'O', 'S'];
const wordmarkPaths = wordmarkLettersRaw.map((item, i) => ({
  letter: letterNames[i],
  d: item.d,
  bbox: item.bbox,
}));

fs.mkdirSync(OUT_ASSETS, { recursive: true });
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-s2-logo.svg'), makeS2Svg('#D0217E', '#FDC415'));
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-s2-yellow.svg'), makeS2Svg('#FDC415', '#FDC415'));
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-s2-magenta.svg'), makeS2Svg('#D0217E', '#D0217E'));
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-s2-white.svg'), makeS2Svg('#FFFFFF', '#FFFFFF'));
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-s2-black.svg'), makeS2Svg('#0D0C12', '#0D0C12'));

const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="170 255 740 570" fill="none">
  <path d="${lockupS.d}" fill="#D0217E" fill-rule="evenodd"/>
  <path d="${lockupTwo.d}" fill="#FDC415" fill-rule="evenodd"/>
  ${wordmarkPaths
    .map(
      (item, i) =>
        `<path d="${item.d}" fill="${i < 3 ? '#D0217E' : '#FDC415'}" fill-rule="evenodd"/>`,
    )
    .join('\n  ')}
</svg>
`;
fs.writeFileSync(path.join(OUT_ASSETS, 'sandos-lockup-bicolor.svg'), lockupSvg);

const moduleContent = `// Auto-generated from Identidad visual.ai (exact Adobe Illustrator Bézier paths)
export const S2_ISOTIPO_PATHS = {
  viewBox: '300 265 480 565',
  width: 480,
  height: 565,
  centerX: 540,
  centerY: 548,
  sPath: ${JSON.stringify(sPath)},
  twoPath: ${JSON.stringify(twoPath)},
};

export const SANDOS_WORDMARK_VIEWBOX = '170 680 740 140';

export const SANDOS_WORDMARK_PATHS = ${JSON.stringify(
  wordmarkPaths.map(({ letter, d }) => ({ letter, d })),
  null,
  2,
)};
`;

fs.writeFileSync(OUT_MODULE, moduleContent);
console.log('Extracted S2 SVG variants & wordmark vectors from Identidad visual.ai:');
console.log(' - S bbox:', sObj.bbox);
console.log(' - 2 bbox:', twoObj.bbox);
console.log(
  ' - Wordmark letters:',
  wordmarkPaths.map((w) => `${w.letter}[${w.bbox.minX}..${w.bbox.maxX}]`).join(', '),
);
