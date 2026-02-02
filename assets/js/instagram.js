// =====================
// Instagram 表示 ON / OFF
// =====================
const INSTAGRAM_ENABLED = true; // false にすると非表示

if (INSTAGRAM_ENABLED) {
  fetch('/parts/instagram.txt')
    .then(response => response.text())
    .then(code => {
      const area = document.getElementById('instagram-area');
      if (!area) return;

      // 埋め込みコードをそのまま流し込む
      area.innerHTML = code;

      // Instagram埋め込みの再処理
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    })
    .catch(error => {
      console.error('Instagram埋め込み読み込みエラー:', error);
    });
}
