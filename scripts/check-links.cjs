const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const required = [
  "Codex를 처음 사용하는 사람들을 위한 가이드",
  "2026. 6. 21. 일 · 오후 3시",
  "ceo@wilab.co.kr",
  "./assets/codex-workshop-hero.png",
];

for (const text of required) {
  if (!html.includes(text)) {
    throw new Error(`Missing required text: ${text}`);
  }
}

const asset = path.join(root, "assets", "codex-workshop-hero.png");
if (!fs.existsSync(asset)) {
  throw new Error("Missing hero image. Run npm run build first.");
}

console.log("Landing page content check passed.");
