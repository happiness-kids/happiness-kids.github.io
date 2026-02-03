/**
 * ============================================
 * Instagram 埋め込み制御スクリプト
 * ============================================
 *
 * 【ここだけ触ればOK】
 * ------------------------------------------------
 * true  : 表示する
 * false : 非表示にする
 */
const INSTAGRAM_SHOW = true;
/*
const INSTAGRAM_SHOW = false;
*/


/**
 * ============================================
 * 以下は原則編集しない
 * ============================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".instagram");
  if (!section) return;

  // 非表示設定の場合は section ごと消す
  if (!INSTAGRAM_SHOW) {
    section.style.display = "none";
    return;
  }

  const container = document.getElementById("instagram-embed");
  if (!container) return;

  fetch("/parts/instagram.txt")
    .then((res) => {
      if (!res.ok) {
        throw new Error("instagram.txt が読み込めません");
      }
      return res.text();
    })
    .then((html) => {
      container.innerHTML = html;
      loadInstagramEmbedScript();
    })
    .catch((err) => {
      console.error("Instagram 埋め込みエラー:", err);
    });
});

/**
 * Instagram公式 embed.js を安全に読み込む
 */
function loadInstagramEmbedScript() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.onload = () => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  };

  document.body.appendChild(script);
}
