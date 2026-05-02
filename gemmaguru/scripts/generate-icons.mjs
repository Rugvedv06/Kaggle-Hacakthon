import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = './public/icons';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Creates a simple green circle icon with "GG" text as SVG base
const svgBase = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1D9E75"/>
  <text x="256" y="300" font-family="sans-serif" font-size="200"
    font-weight="bold" fill="white" text-anchor="middle">GG</text>
</svg>`;

for (const size of sizes) {
  await sharp(Buffer.from(svgBase))
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
