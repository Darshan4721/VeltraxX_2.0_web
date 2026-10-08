import sharp from 'sharp';
import path from 'path';

async function makeTransparent(inputPath, outputPath, threshold = 238, falloff = 35) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Background is near white (r, g, b all high and close to each other)
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;

    // Check if it's white/light-grey background (low saturation, high brightness)
    if (minVal > threshold - falloff && diff < 25) {
      if (minVal >= threshold) {
        data[i + 3] = 0; // completely transparent
      } else {
        const factor = (threshold - minVal) / falloff;
        data[i + 3] = Math.round(255 * factor);
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);
  console.log(`Successfully created: ${outputPath}`);
}

async function run() {
  await makeTransparent(
    'public/images/hero-chip-3d.jpg',
    'public/images/hero-chip-transparent.png',
    235,
    30
  );
  await makeTransparent(
    'public/images/chip-burst-3d.jpg',
    'public/images/chip-burst-transparent.png',
    240,
    30
  );
  await makeTransparent(
    'public/images/trophy-3d.jpg',
    'public/images/trophy-transparent.png',
    235,
    30
  );
  await makeTransparent(
    'public/images/chip-stack-exploded.jpg',
    'public/images/chip-stack-exploded-transparent.png',
    238,
    30
  );
}

run().catch(console.error);
