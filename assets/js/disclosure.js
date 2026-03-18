document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("disclosure-list");
  if (!list) return;

  fetch("files.json")
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((files) => {
      if (!files || files.length === 0) {
        const li = document.createElement("li");
        li.className = "disclosure-empty";
        li.textContent = "現在、公開中の資料はありません。";
        list.appendChild(li);
        return;
      }

      files.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.file;
        a.textContent = item.title;
        a.target = "_blank";
        a.rel = "noopener";
        li.appendChild(a);
        list.appendChild(li);
      });
    })
    .catch(() => {
      const li = document.createElement("li");
      li.className = "disclosure-empty";
      li.textContent = "資料の読み込みに失敗しました。";
      list.appendChild(li);
    });
});
