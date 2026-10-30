const fs = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, '../server/node_modules/sharp'));

async function createIco() {
  const rootDir = path.resolve(__dirname, '..');
  const buildDir = path.join(rootDir, 'build');
  const srcPng = path.join(buildDir, 'icon.png');
  const outIco = path.join(buildDir, 'icon.ico');

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(srcPng).resize(size, size).png().toBuffer();
    pngBuffers.push({ size, buf });
  }

  // Windows ICO header (6 bytes)
  // Reserved (2 bytes, 0), Type (2 bytes, 1 for icon), ImageCount (2 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);

  // Directory entries: 16 bytes per image
  const dirEntrySize = 16;
  const dirEntries = Buffer.alloc(dirEntrySize * sizes.length);
  let currentOffset = 6 + (dirEntrySize * sizes.length);

  for (let i = 0; i < sizes.length; i++) {
    const { size, buf } = pngBuffers[i];
    const offset = i * dirEntrySize;
    // Width (1 byte, 0 = 256)
    dirEntries.writeUInt8(size === 256 ? 0 : size, offset + 0);
    // Height (1 byte, 0 = 256)
    dirEntries.writeUInt8(size === 256 ? 0 : size, offset + 1);
    // Colors (1 byte, 0 = no palette)
    dirEntries.writeUInt8(0, offset + 2);
    // Reserved (1 byte, 0)
    dirEntries.writeUInt8(0, offset + 3);
    // Color planes (2 bytes, 1)
    dirEntries.writeUInt16LE(1, offset + 4);
    // Bits per pixel (2 bytes, 32)
    dirEntries.writeUInt16LE(32, offset + 6);
    // Image data size (4 bytes)
    dirEntries.writeUInt32LE(buf.length, offset + 8);
    // Image data offset (4 bytes)
    dirEntries.writeUInt32LE(currentOffset, offset + 12);

    currentOffset += buf.length;
  }

  const allBuffers = [header, dirEntries, ...pngBuffers.map(p => p.buf)];
  const finalIco = Buffer.concat(allBuffers);

  fs.writeFileSync(outIco, finalIco);
  console.log(`✅ Generated valid Windows icon: ${outIco} (${finalIco.length} bytes)`);
}

createIco().catch(err => {
  console.error(err);
  process.exit(1);
});
