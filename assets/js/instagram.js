document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".about-instagram");
  if (!section) return;

  const container = document.getElementById("instagram-embed");
  if (!container) return;

  fetch("./parts/instagram.txt")
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
      loadInstagramEmbedScript();
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
