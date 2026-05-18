const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const width = 1200;
const height = 800;
const pixels = Buffer.alloc(width * height * 4);

function rgba(hex, alpha = 255) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    alpha,
  ];
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = (y * width + x) * 4;
  pixels[idx] = color[0];
  pixels[idx + 1] = color[1];
  pixels[idx + 2] = color[2];
  pixels[idx + 3] = color[3];
}

function rect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(xx, yy, color);
    }
  }
}

function roundedRect(x, y, w, h, r, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const dx = Math.max(x - xx + r, 0, xx - (x + w - r - 1));
      const dy = Math.max(y - yy + r, 0, yy - (y + h - r - 1));
      if (dx * dx + dy * dy <= r * r) setPixel(xx, yy, color);
    }
  }
}

function line(x1, y1, x2, y2, color, thickness = 3) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(mix(x1, x2, t));
    const y = Math.round(mix(y1, y2, t));
    rect(x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, color);
  }
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([len, typeBuffer, data, crc]);
}

const top = rgba("#f8efe0");
const bottom = rgba("#dfe9e6");
for (let y = 0; y < height; y += 1) {
  const t = y / (height - 1);
  const base = [mix(top[0], bottom[0], t), mix(top[1], bottom[1], t), mix(top[2], bottom[2], t), 255];
  for (let x = 0; x < width; x += 1) setPixel(x, y, base);
}

roundedRect(96, 78, 1008, 644, 26, rgba("#17212b"));
roundedRect(118, 104, 964, 592, 18, rgba("#fbf8f2"));
rect(118, 104, 964, 54, rgba("#17212b"));
rect(148, 124, 16, 16, rgba("#d95f45"));
rect(176, 124, 16, 16, rgba("#c89531"));
rect(204, 124, 16, 16, rgba("#1f7a5d"));

roundedRect(146, 190, 260, 452, 12, rgba("#263543"));
for (let i = 0; i < 9; i += 1) {
  rect(172, 228 + i * 42, 42 + (i % 3) * 32, 8, rgba(i % 2 ? "#c8d3dc" : "#f4d28c"));
  rect(244, 228 + i * 42, 110 + (i % 4) * 18, 8, rgba("#6fa3cc"));
}

roundedRect(442, 190, 478, 270, 12, rgba("#ffffff"));
for (let i = 0; i < 7; i += 1) {
  const y = 232 + i * 30;
  rect(478, y, 72, 9, rgba("#d95f45"));
  rect(566, y, 210 - i * 13, 9, rgba("#17212b"));
  rect(784 - i * 16, y, 74 + i * 8, 9, rgba("#1f7a5d"));
}

roundedRect(442, 492, 478, 150, 12, rgba("#17212b"));
for (let i = 0; i < 5; i += 1) {
  rect(480, 526 + i * 22, 24, 8, rgba("#1f7a5d"));
  rect(520, 526 + i * 22, 220 - i * 22, 8, rgba("#c8d3dc"));
}

roundedRect(946, 190, 96, 452, 12, rgba("#eef3ef"));
line(994, 230, 994, 590, rgba("#1f7a5d"), 5);
for (const y of [244, 334, 424, 514, 590]) {
  roundedRect(978, y - 16, 32, 32, 16, rgba("#1f7a5d"));
}

for (const [x, y, c] of [
  [820, 92, "#d95f45"],
  [1000, 682, "#2267a8"],
  [92, 660, "#c89531"],
  [1040, 110, "#1f7a5d"],
]) {
  roundedRect(x, y, 54, 54, 27, rgba(c, 210));
}

const raw = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y += 1) {
  raw[y * (width * 4 + 1)] = 0;
  pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const output = path.join(__dirname, "..", "assets", "codex-workshop-hero.png");
fs.writeFileSync(output, png);
console.log(`Generated ${output}`);
