/* scripts/regenerate-pages.js
   assets/data/jobs.json から recruit/<filename>.html を全件再生成する。
   ローカル実行(移行時の検証)と GitHub Actions の両方から使う。
   npm依存なし（fsのみ使用）。
*/
const fs = require("fs");
const path = require("path");
const { generateHTML } = require("../assets/js/job-html-template.js");

const ROOT = path.join(__dirname, "..");
const RECRUIT_DIR = path.join(ROOT, "recruit");
const jobs = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/jobs.json"), "utf8"));

jobs.forEach((job) => {
  const outPath = path.join(RECRUIT_DIR, `${job.filename}.html`);
  fs.writeFileSync(outPath, generateHTML(job), "utf8");
  console.log(`wrote recruit/${job.filename}.html`);
});

// jobs.jsonから削除された求人の自動生成ページを掃除する。
// job-html-template.js が出力する「自動生成」マーカーコメントを持つファイルのみ対象とし、
// 手動管理のレガシーページ（例: job-hoikushi-jidoushidouin.html）は誤って削除しない。
const currentFilenames = new Set(jobs.map((job) => `${job.filename}.html`));
fs.readdirSync(RECRUIT_DIR)
  .filter((file) => /^job-.*\.html$/.test(file) && !currentFilenames.has(file))
  .forEach((file) => {
    const filePath = path.join(RECRUIT_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes(`<!-- recruit/${file} 自動生成 -->`)) {
      fs.unlinkSync(filePath);
      console.log(`removed recruit/${file} (jobs.jsonに存在しないため削除)`);
    }
  });
