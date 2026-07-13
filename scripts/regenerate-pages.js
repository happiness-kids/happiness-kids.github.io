/* scripts/regenerate-pages.js
   assets/data/jobs.json から recruit/<filename>.html を全件再生成する。
   ローカル実行(移行時の検証)と GitHub Actions の両方から使う。
   npm依存なし（fsのみ使用）。
*/
const fs = require("fs");
const path = require("path");
const { generateHTML } = require("../assets/js/job-html-template.js");

const ROOT = path.join(__dirname, "..");
const jobs = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/jobs.json"), "utf8"));

jobs.forEach((job) => {
  const outPath = path.join(ROOT, "recruit", `${job.filename}.html`);
  fs.writeFileSync(outPath, generateHTML(job), "utf8");
  console.log(`wrote recruit/${job.filename}.html`);
});
