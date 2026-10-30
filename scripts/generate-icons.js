const fs = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, '../server/node_modules/sharp'));

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>

    <!-- Ring Gradient 1 -->
    <linearGradient id="ringGrad" x1="60" y1="60" x2="450" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="45%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>

    <!-- Glowing Accent -->
    <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient>

    <!-- Inner Shadow / Glow Filter -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="ambientShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#6366f1" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background App Squircle -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="4"/>

  <!-- Ambient Light Behind Ring -->
  <circle cx="256" cy="256" r="160" fill="url(#ringGrad)" opacity="0.15" filter="url(#softGlow)"/>

  <!-- Conversion Outer Arcs Group -->
  <g filter="url(#ambientShadow)">
    <!-- Top-Right Arc with Arrowhead -->
    <path d="M 170 145 C 220 120, 310 120, 360 160 C 390 185, 405 220, 405 256" 
          fill="none" stroke="url(#ringGrad)" stroke-width="26" stroke-linecap="round"/>
    <!-- Top Arrowhead -->
    <path d="M 375 240 L 405 270 L 435 240" 
          fill="none" stroke="url(#ringGrad)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Bottom-Left Arc with Arrowhead -->
    <path d="M 342 367 C 292 392, 202 392, 152 352 C 122 327, 107 292, 107 256" 
          fill="none" stroke="url(#ringGrad)" stroke-width="26" stroke-linecap="round"/>
    <!-- Bottom Arrowhead -->
    <path d="M 137 272 L 107 242 L 77 272" 
          fill="none" stroke="url(#ringGrad)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Central Modern 'i' Glyph -->
  <!-- 'i' Dot: Radiant Glowing Cyan Orb -->
  <circle cx="256" cy="195" r="22" fill="#38bdf8" filter="url(#softGlow)"/>
  <circle cx="256" cy="195" r="17" fill="#ffffff"/>

  <!-- 'i' Stem: Sleek Capsule -->
  <rect x="238" y="240" width="36" height="96" rx="18" fill="url(#ringGrad)"/>

  <!-- Dynamic Accent Sparks -->
  <circle cx="160" cy="190" r="5" fill="#38bdf8" opacity="0.7"/>
  <circle cx="355" cy="325" r="5" fill="#a855f7" opacity="0.7"/>
</svg>
`;

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const websiteDir = path.resolve(rootDir, '..', 'iConvert-website');
  const buildDir = path.join(rootDir, 'build');

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // 1. Save SVG files
  fs.writeFileSync(path.join(buildDir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(rootDir, 'client', 'public', 'favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(websiteDir, 'public', 'favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(websiteDir, 'public', 'logo.svg'), svgIcon);

  // 2. Generate PNGs using Sharp
  const svgBuffer = Buffer.from(svgIcon);
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));

  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(buildDir, 'icon-256.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(websiteDir, 'public', 'icon-512.png'));

  console.log('✅ Icons and SVGs generated successfully in root/build and website/public!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
