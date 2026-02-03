document.addEventListener("DOMContentLoaded", () => {

  // === 設定 ===
  const ENABLE_INSTAGRAM = true; // ← false にすると非表示

  const section = document.querySelector(".instagram-section");
  const embedArea = document.querySelector(".instagram-embed");

  if (!ENABLE_INSTAGRAM) {
    section.classList.add("is-hide");
    return;
  }

  fetch("assets/embeds/instagram.txt")
    .then(response => {
      if (!response.ok) throw new Error("instagram.txt が読み込めません");
      return response.text();
    })
    .then(html => {
      embedArea.innerHTML = html;

      // Instagramの描画を明示的に実行
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    })
    .catch(error => {
      console.error(error);
      section.classList.add("is-hide");
    });
});
