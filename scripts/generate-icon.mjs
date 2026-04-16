#!/usr/bin/env node

/**
 * Generate app icon using Doubao Seedream text-to-image API
 * Usage: node scripts/generate-icon.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'web', 'public');

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const API_KEY = 'c6795be3-65e9-494f-a669-f315d50ebc3f';
const MODEL = 'doubao-seedream-5-0-260128';

const PROMPT = `A minimalist mobile app icon for a couples finance tracking app called "合账". Simple flat design with warm coral gradient background from #FF6B6B to #FFAB91. A clean white line-art icon of two overlapping coins with a small heart symbol, centered on the gradient background. Rounded square shape (iOS app icon style). No text, no words, no letters. Professional app store quality, centered symmetric composition, clean vector style.`;

async function generateIcon() {
  console.log('🎨 Calling Doubao Seedream API...');
  console.log(`   Model: ${MODEL}`);
  console.log(`   Prompt: ${PROMPT.slice(0, 80)}...`);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: PROMPT,
      size: '2048x2048',
      response_format: 'b64_json',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ API error ${res.status}: ${text}`);
    process.exit(1);
  }

  const json = await res.json();

  if (!json.data?.[0]?.b64_json) {
    // Try URL format
    if (json.data?.[0]?.url) {
      console.log('📥 Downloading from URL...');
      const imgRes = await fetch(json.data[0].url);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const outPath = path.join(PUBLIC_DIR, 'icon-generated.png');
      fs.writeFileSync(outPath, buffer);
      console.log(`✅ Saved to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return outPath;
    }
    console.error('❌ Unexpected response:', JSON.stringify(json).slice(0, 500));
    process.exit(1);
  }

  const buffer = Buffer.from(json.data[0].b64_json, 'base64');
  const outPath = path.join(PUBLIC_DIR, 'icon-generated.png');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Saved to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return outPath;
}

async function resizeIcons(sourcePath) {
  // Try using sharp if available, otherwise just copy
  try {
    const { default: sharp } = await import('sharp');

    // 512x512
    await sharp(sourcePath)
      .resize(512, 512)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
    console.log('✅ icon-512.png generated');

    // 192x192
    await sharp(sourcePath)
      .resize(192, 192)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
    console.log('✅ icon-192.png generated');

    // favicon — 48x48 png, save as .ico (browsers accept PNG favicons)
    await sharp(sourcePath)
      .resize(48, 48)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log('✅ favicon.ico generated');

  } catch (e) {
    console.log('⚠️  sharp not available, using raw copy for 512px');
    fs.copyFileSync(sourcePath, path.join(PUBLIC_DIR, 'icon-512.png'));
    console.log('✅ icon-512.png copied (original size)');
    console.log('⚠️  Install sharp for proper resizing: npm i -D sharp');
  }
}

async function main() {
  console.log('');
  console.log('=== 合账 App Icon Generator ===');
  console.log('');

  const sourcePath = await generateIcon();
  await resizeIcons(sourcePath);

  // Clean up generated source
  if (fs.existsSync(path.join(PUBLIC_DIR, 'icon-generated.png'))) {
    fs.unlinkSync(path.join(PUBLIC_DIR, 'icon-generated.png'));
  }

  console.log('');
  console.log('🎉 Done! Check web/public/ for the new icons.');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
