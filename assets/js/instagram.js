document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".about-instagram");
  if (!section) return;

  const container = document.getElementById("instagram-embed");
  if (!container) return;

  fetch("../parts/instagram.txt")
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.text();
    })
    .then((html) => {

      // script行を自動削除
      html = html.replace(
        /<script.*?instagram\.com\/embed\.js.*?<\/script>/is,
        ""
      );

      // 空なら非表示
      if (!html.trim()) {
        section.remove();
        return;
      }

      container.innerHTML = html;

      // Instagram embed.js 読み込み
      loadInstagramEmbedScript();

      /* =========================
         ここから追加（続きを読む制御）
      ========================== */

      const preview = section.querySelector(".about-instagram-preview");
      const button = section.querySelector(".about-instagram-toggle button");

      if (preview && button) {
        button.addEventListener("click", () => {
          preview.classList.toggle("is-open");

          if (preview.classList.contains("is-open")) {
            button.textContent = "閉じる";
          } else {
            button.textContent = "続きを読む";
          }
        });
      }

    })
    .catch(() => {
      section.remove();
    });
});


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
