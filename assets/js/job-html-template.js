/* assets/js/job-html-template.js
   求人詳細ページ(recruit/job-*.html)のHTML生成テンプレート。
   ブラウザ(tools/job-generator.html)とNode.js(scripts/regenerate-pages.js)の
   両方から同じ実装を使うことで、テンプレートのズレを防ぐ。
*/

function escapeHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function nl2br(s) {
  return escapeHtml(s).replace(/\n/g, "<br>\n");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateHTML(v) {
  const ul = v.salaryType === "MONTH" ? "月給" : "時給";
  const fmt = n => (n || 0).toLocaleString("ja-JP");
  const sd = `${ul} ${fmt(v.salaryMin)}円 〜 ${fmt(v.salaryMax)}円`;
  const intro = v.intro || "ハピネスキッズでは、子どもたちの成長を一緒に支えるスタッフを募集しています。";
  const metaDesc = v.metaDesc || `高知市の放課後等デイサービス ハピネスキッズで${v.title}を募集しています。`;
  const isExpired = !!(v.end && v.end < todayStr());
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "JobPosting",
    "title": v.title, "description": metaDesc,
    "employmentType": v.employment, "datePosted": v.start, "validThrough": v.end,
    "hiringOrganization": { "@type": "Organization", "name": "合同会社足人" },
    "jobLocation": { "@type": "Place", "address": {
      "@type": "PostalAddress", "postalCode": "780-0931", "addressCountry": "JP",
      "addressRegion": "高知県", "addressLocality": "高知市", "streetAddress": "玉水町5 岩貞ビル"
    }},
    "baseSalary": { "@type": "MonetaryAmount", "currency": "JPY", "value": {
      "@type": "QuantitativeValue", "minValue": v.salaryMin, "maxValue": v.salaryMax, "unitText": v.salaryType
    }}
  }, null, 2);

  const prefRow    = v.preferred   ? `<tr><th>歓迎条件</th><td>${nl2br(v.preferred)}</td></tr>` : "";
  const hoursRow   = v.hours       ? `<tr><th>勤務時間</th><td>${nl2br(v.hours)}</td></tr>` : "";
  const holidayRow = v.holidays    ? `<tr><th>休日・休暇</th><td>${nl2br(v.holidays)}</td></tr>` : "";
  const reqRow     = v.requirements? `<tr><th>応募資格</th><td>${escapeHtml(v.requirements)}</td></tr>` : "";
  const salaryNote = v.salaryNote  ? `<div class="recruit-note">※${escapeHtml(v.salaryNote)}</div>` : "";

  const hwBlock = v.hwNumber ? `
  <p class="recruit-hw">
    ハローワークでの応募も受け付けています。<br>
    ハローワーク求人番号：${escapeHtml(v.hwNumber)}<br>
    <a href="https://www.hellowork.mhlw.go.jp/" target="_blank" rel="noopener" class="button-link">ハローワークインターネットサービスで確認する</a>
  </p>
  <p class="recruit-note">※ハローワークでの掲載期間が終了し、求人票が確認できない場合がございます。あらかじめご了承ください。</p>` : "";

  const robotsTag = isExpired ? `\n<meta name="robots" content="noindex">` : "";
  const jsonLdBlock = isExpired ? "" : `
<!-- Google しごと検索用 構造化データ -->
<script type="application/ld+json">
${jsonLd}
<\/script>`;
  const expiredNotice = isExpired ? `
<section class="recruit-detail-intro">
  <p class="recruit-note">※この求人の募集は終了しました。現在募集中の求人は<a href="./">採用情報一覧</a>をご覧ください。</p>
</section>` : "";

  return `<!DOCTYPE html>
<!-- recruit/${v.filename}.html 自動生成 -->
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(v.title)}｜高知市 放課後等デイサービス ハピネスキッズ 求人</title>
<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">${robotsTag}
<link rel="icon" href="../assets/images/icon.png">
<link rel="stylesheet" href="../assets/css/common.css">
${jsonLdBlock}
</head>
<body>

<!-- ヘッダー -->
<header class="site-header">
  <div class="site-header-inner">
    <img src="../assets/images/icon.png" class="site-icon" alt="">
    <span class="site-title">放課後等デイサービス　ハピネスキッズ</span>
  </div>
</header>
${expiredNotice}
<!-- 紹介文 -->
<section class="recruit-detail-intro">
  <h1>${escapeHtml(v.title)}</h1>
  <p>${nl2br(intro)}</p>
</section>
${v.jobContent ? `
<!-- 仕事内容 -->
<section class="recruit-detail-section">
  <h2>仕事内容</h2>
  <table class="recruit-table">
    <tr><th>業務内容</th><td>${nl2br(v.jobContent)}</td></tr>
  </table>
</section>` : ""}

<!-- 応募・勤務条件 -->
<section class="recruit-detail-section">
  <h2>応募条件・勤務条件</h2>
  <table class="recruit-table">
    ${reqRow}
    ${prefRow}
    ${hoursRow}
    ${holidayRow}
    <tr>
      <th>給与</th>
      <td>${sd}${salaryNote}</td>
    </tr>
    <tr>
      <th>勤務地</th>
      <td>〒780-0931<br>高知県高知市玉水町5 岩貞ビル<br>放課後等デイサービス ハピネスキッズ</td>
    </tr>
  </table>
</section>

<!-- 応募方法 -->
<section class="recruit-apply">
  <h2>応募方法</h2>
  <p>
    <a href="mailto:mail@happiness-kids.net?subject=${encodeURIComponent(`求人応募について（${v.title}）`)}" class="button-link">
      メールで応募する
    </a>
  </p>
  <p class="recruit-apply-phone">お電話でのお問い合わせ：<a href="tel:0888248810">088-824-8810</a></p>
  <p class="recruit-note">担当：豊永</p>${hwBlock}
</section>

<!-- フッターリンク -->
<section class="footer-nav">
  <a href="./" class="footer-button">採用情報</a>
</section>

<!-- フッター -->
<footer class="site-footer">
  <p>&copy; ハピネスキッズ</p>
</footer>

</body>
</html>
`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateHTML };
}
