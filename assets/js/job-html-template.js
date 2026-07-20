/* assets/js/job-html-template.js
   求人詳細ページ(recruit/job-*.html)のHTML生成テンプレート。
   ブラウザ(tools/job-generator.html)とNode.js(scripts/regenerate-pages.js)の
   両方から同じ実装を使うことで、テンプレートのズレを防ぐ。

   設計（2026-07-20 刷新）:
   - 求人データ(v) と 共通プロフィール(profile) の2つを入力に取る。
   - buildSections() が「出力順序」を1か所で定義し、
     ・JobPosting の description（Googleしごと検索の詳細パネル用・長文）
     ・人間が見る表示ページのHTML本文
     の両方を同じセクション配列から生成する（単一ソース・2出力）。
   - profile は assets/data/profile.json が唯一の管理点。会社名・住所・施設情報など。
   - 共通項目（福利厚生・研修・選考フロー・職場の魅力）は求人ごとに
     <field>Override で上書き可能。空ならプロフィールの値を使う。
*/

const DEFAULT_PROFILE = {
  companyName: "合同会社足人",
  facilityName: "放課後等デイサービス ハピネスキッズ",
  postalCode: "780-0931",
  addressRegion: "高知県",
  addressLocality: "高知市",
  streetAddress: "玉水町5 岩貞ビル",
  email: "mail@happiness-kids.net",
  phone: "088-824-8810",
  contactName: "豊永",
  facilityType: "放課後等デイサービス",
  capacity: "",
  targetUsers: "",
  staffComposition: "",
  established: "",
  businessDays: "",
  transport: "",
  benefits: "",
  training: "",
  selectionProcess: "",
  appeal: "",
};

function escapeHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 表示ページ用: 改行を <br>\n に（読みやすい整形済みHTML）
function nl2br(s) {
  return escapeHtml(s).replace(/\n/g, "<br>\n");
}

// JSON-LD description 用: 改行を <br> に（1行に詰める）
function nl2brInline(s) {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 共通項目の実効値: 求人側の上書き(<key>Override)が非空ならそれ、無ければプロフィール値
function effective(v, profile, key) {
  const ov = (v[key + "Override"] || "").trim();
  return ov || (profile[key] || "");
}

/* =====================================================
   出力順序の定義（ここが唯一のセクション順・唯一の内容ソース）
   各セクション: { key, heading, body, kind }
   kind: "hero" | "tags" | "prose" | "table" | "apply"
   htmlSkip=true のセクションは表示ページには出さず description のみに出す
   （例: 職場紹介にintroをフォールバックした場合、heroと重複するため表示ページでは省く）
===================================================== */
function buildSections(v, profile) {
  const P = Object.assign({}, DEFAULT_PROFILE, profile || {});
  const fmt = (n) => (n || 0).toLocaleString("ja-JP");
  const ul = v.salaryType === "MONTH" ? "月給" : "時給";

  // 給与ブロック（基本給＋昇給・賞与＋諸手当）
  const raiseBonus = (v.raiseBonus || v.salaryNote || "").trim(); // salaryNoteは旧データ互換
  const allowances = (v.allowances || "").trim();
  const salaryLines = [`${ul} ${fmt(v.salaryMin)}円 〜 ${fmt(v.salaryMax)}円`];
  if (raiseBonus) salaryLines.push(`〈昇給・賞与〉\n${raiseBonus}`);
  if (allowances) salaryLines.push(`〈諸手当〉\n${allowances}`);
  const salaryBody = salaryLines.join("\n");

  // 施設情報ブロック（プロフィールから）
  const facilityLines = [];
  const addFac = (label, val) => { if ((val || "").trim()) facilityLines.push(`${label}：${val}`); };
  addFac("施設形態", P.facilityType);
  addFac("利用者定員", P.capacity);
  addFac("対象", P.targetUsers);
  addFac("スタッフ構成", P.staffComposition);
  addFac("設立", P.established);
  addFac("営業日", P.businessDays);
  addFac("送迎", P.transport);
  const facilityBody = facilityLines.join("\n");

  // 勤務地
  const locationBody =
    `〒${P.postalCode} ${P.addressRegion}${P.addressLocality}${P.streetAddress}\n${P.facilityName}`;

  // 応募方法
  const applyLines = [`メール：${P.email}`, `電話：${P.phone}（担当：${P.contactName}）`];
  if ((v.hwNumber || "").trim()) applyLines.push(`ハローワークからの応募も可能です（求人番号：${v.hwNumber}）`);
  const applyBody = applyLines.join("\n");

  // 職場の特徴: 上書き→プロフィールappeal。無ければintroにフォールバック（descriptionのみ）
  const appealEff = effective(v, P, "appeal").trim();
  const intro = (v.intro || "").trim();
  const workplaceBody = appealEff || intro;

  const raw = [
    { key: "point",        heading: "求人のポイント",           body: (v.point || "").trim(),          kind: "hero"  },
    { key: "keywords",     heading: "",                          body: parseKeywords(v.keywords).join("・"), kind: "keywords" },
    { key: "jobContent",   heading: "仕事内容",                  body: (v.jobContent || "").trim(),     kind: "prose" },
    { key: "workplace",    heading: "職場の特徴・支援方針",      body: workplaceBody,                    kind: "prose", htmlSkip: !appealEff },
    { key: "requirements", heading: "応募資格",                  body: (v.requirements || "").trim(),   kind: "table" },
    { key: "preferred",    heading: "歓迎条件",                  body: (v.preferred || "").trim(),      kind: "table" },
    { key: "suitableFor",  heading: "こんな方に向いています",    body: (v.suitableFor || "").trim(),    kind: "prose" },
    { key: "salary",       heading: "給与",                      body: salaryBody,                       kind: "table" },
    { key: "hours",        heading: "勤務時間",                  body: (v.hours || "").trim(),          kind: "table" },
    { key: "workSystem",   heading: "勤務体制",                  body: (v.workSystem || "").trim(),     kind: "table" },
    { key: "holidays",     heading: "休日・休暇",                body: (v.holidays || "").trim(),       kind: "table" },
    { key: "longHoliday",  heading: "長期休暇",                  body: (v.longHoliday || "").trim(),    kind: "table" },
    { key: "benefits",     heading: "福利厚生・待遇",            body: effective(v, P, "benefits").trim(),        kind: "table" },
    { key: "training",     heading: "教育・研修体制",            body: effective(v, P, "training").trim(),        kind: "prose" },
    { key: "staffVoice",   heading: "スタッフの声",              body: (v.staffVoice || "").trim(),     kind: "prose" },
    { key: "facility",     heading: "施設情報",                  body: facilityBody,                     kind: "table" },
    { key: "selection",    heading: "選考の流れ",                body: effective(v, P, "selectionProcess").trim(), kind: "prose" },
    { key: "recruiterMsg", heading: "採用担当者からのメッセージ", body: (v.recruiterMessage || "").trim(), kind: "prose" },
    { key: "location",     heading: "勤務地・アクセス",          body: locationBody,                     kind: "table" },
    { key: "apply",        heading: "応募方法",                  body: applyBody,                        kind: "apply" },
  ];

  return raw.filter((s) => s.body);
}

// JSON-LD の description（長文求人票）を組み立てる
function buildJobPostingDescription(sections) {
  return sections
    .map((s) => {
      const txt = s.heading ? `【${s.heading}】\n${s.body}` : s.body;
      return nl2brInline(txt);
    })
    .join("<br><br>");
}

// 特徴・歓迎キーワード文字列 → 配列（空白/読点/中黒区切り、先頭の#は除去）
function parseKeywords(str) {
  return (str || "")
    .split(/[\s、,・]+/)
    .map((t) => t.replace(/^#/, "").trim())
    .filter(Boolean);
}

function generateHTML(v, profile) {
  const P = Object.assign({}, DEFAULT_PROFILE, profile || {});
  const metaDesc = v.metaDesc || `高知市の放課後等デイサービス ハピネスキッズで${v.title}を募集しています。`;
  const isExpired = !!(v.end && v.end < todayStr());

  const sections = buildSections(v, P);

  // ---- JSON-LD 構造化データ ----
  const jsonLdObj = {
    "@context": "https://schema.org", "@type": "JobPosting",
    "title": v.title, "description": buildJobPostingDescription(sections),
    "employmentType": v.employment, "datePosted": v.start, "validThrough": v.end,
    "hiringOrganization": { "@type": "Organization", "name": P.companyName },
    "jobLocation": { "@type": "Place", "address": {
      "@type": "PostalAddress", "postalCode": P.postalCode, "addressCountry": "JP",
      "addressRegion": P.addressRegion, "addressLocality": P.addressLocality, "streetAddress": P.streetAddress
    }},
    "baseSalary": { "@type": "MonetaryAmount", "currency": "JPY", "value": {
      "@type": "QuantitativeValue", "minValue": v.salaryMin, "maxValue": v.salaryMax, "unitText": v.salaryType
    }}
  };

  const hasEdu = !!(v.eduEnabled && v.eduCredentials && v.eduCredentials.length);
  const hasExp = !!(v.expEnabled && v.expMonths);
  if (hasEdu) {
    jsonLdObj.educationRequirements = {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": v.eduCredentials.length === 1 ? v.eduCredentials[0] : v.eduCredentials
    };
  }
  if (hasExp) {
    jsonLdObj.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": v.expMonths
    };
  }
  if (hasEdu && hasExp && v.expInPlaceOfEdu) {
    jsonLdObj.experienceInPlaceOfEducation = true;
  }
  const jsonLd = JSON.stringify(jsonLdObj, null, 2);

  // ---- 表示ページ本文（同じ sections から生成）----
  const heroSec = sections.find((s) => s.key === "point");
  const kwSec = sections.find((s) => s.key === "keywords");
  const intro = (v.intro || "").trim();

  const pointBlock = heroSec ? `\n  <div class="recruit-point">${nl2br(heroSec.body)}</div>` : "";
  const kwBlock = kwSec ? `\n  <p class="recruit-keywords">${escapeHtml(kwSec.body)}</p>` : "";
  const introBlock = intro ? `\n  <p>${nl2br(intro)}</p>` : "";

  // hero/tags/apply 以外を本文に流し込む。table種を連続してまとめる。
  let bodyHtml = "";
  let tableBuf = [];
  const flush = () => {
    if (!tableBuf.length) return;
    bodyHtml += `
<section class="recruit-detail-section">
  <table class="recruit-table">
${tableBuf.map((s) => `    <tr><th>${escapeHtml(s.heading)}</th><td>${nl2br(s.body)}</td></tr>`).join("\n")}
  </table>
</section>`;
    tableBuf = [];
  };

  sections.forEach((s) => {
    if (s.key === "point" || s.key === "keywords" || s.key === "apply") return;
    if (s.htmlSkip) return;
    if (s.kind === "table") {
      tableBuf.push(s);
    } else {
      flush();
      bodyHtml += `
<section class="recruit-detail-section">
  <h2>${escapeHtml(s.heading)}</h2>
  <p>${nl2br(s.body)}</p>
</section>`;
    }
  });
  flush();

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
  <h1>${escapeHtml(v.title)}</h1>${pointBlock}${kwBlock}${introBlock}
</section>
${bodyHtml}

<!-- 応募方法 -->
<section class="recruit-apply">
  <h2>応募方法</h2>
  <p>
    <a href="mailto:${P.email}?subject=${encodeURIComponent(`求人応募について（${v.title}）`)}" class="button-link">
      メールで応募する
    </a>
  </p>
  <p class="recruit-apply-phone">お電話でのお問い合わせ：<a href="tel:${P.phone.replace(/[^0-9]/g, "")}">${P.phone}</a></p>
  <p class="recruit-note">担当：${escapeHtml(P.contactName)}</p>${hwBlock}
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
  module.exports = { generateHTML, buildSections, buildJobPostingDescription, DEFAULT_PROFILE, parseKeywords };
}
