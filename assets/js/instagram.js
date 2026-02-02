const INSTAGRAM_ENABLED = true;　// trueで表示、falseの時は非表示
if (INSTAGRAM_ENABLED) {
  fetch('/parts/instagram.txt')
    .then(res => res.text())
    .then(html => {
      const area = document.getElementById('instagram-area');
      if (!area) return;

      area.innerHTML = html;

      // embed.js が未読み込みなら追加
      if (!window.instgrm) {
        const script = document.createElement('script');
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
          }
        };
      } else {
        window.instgrm.Embeds.process();
      }
    });
}
