const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const required = [
  "처음 쓰는 사람도 Codex로 끝까지 작업하기",
  "한 번의 작업을 처음부터 끝까지 경험합니다",
  "초보자가 복사해서 쓰기 좋은 Codex 요청문",
  "2026. 6. 21. 일 · 오후 3시",
  "ceo@wilab.co.kr",
  "./assets/codex-workshop-hero-people.png",
];

for (const text of required) {
  if (!html.includes(text) && !plainText.includes(text)) {
    throw new Error(`Missing required text: ${text}`);
  }
}

const asset = path.join(root, "assets", "codex-workshop-hero-people.png");
if (!fs.existsSync(asset)) {
  throw new Error("Missing hero image. Run npm run build first.");
}

console.log("Landing page content check passed.");
