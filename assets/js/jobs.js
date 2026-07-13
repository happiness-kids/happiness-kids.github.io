/* assets/js/jobs.js
   採用情報一覧の表示制御
   - jobs.json を取得して期間内の求人のみ表示
   - 表示対象がない場合はメッセージを表示
*/

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("recruit-list");
  if (!list) return;

  fetch("../assets/data/jobs.json")
    .then((res) => {
      if (!res.ok) throw new Error("fetch failed");
      return res.json();
    })
    .then((jobs) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const active = jobs.filter((job) => {
        const start = new Date(job.start);
        const end   = new Date(job.end);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      });

      if (active.length === 0) {
        const li = document.createElement("li");
        li.className = "recruit-empty";
        li.textContent = "現在、募集中の求人はありません。";
        list.appendChild(li);
        return;
      }

      active.forEach((job) => {
        const href = `${job.filename}.html`;
        const li = document.createElement("li");
        li.className = "recruit-item";

        const title = document.createElement("a");
        title.href      = href;
        title.textContent = job.title;
        title.className = "recruit-title";

        const comment = document.createElement("p");
        comment.className = "recruit-comment";
        comment.textContent = job.comment;

        const btn = document.createElement("a");
        btn.href      = href;
        btn.textContent = "求人詳細ページへ";
        btn.className = "button-link recruit-btn";

        li.appendChild(title);
        li.appendChild(comment);
        li.appendChild(btn);
        list.appendChild(li);
      });
    })
    .catch(() => {
      const li = document.createElement("li");
      li.className = "recruit-empty";
      li.textContent = "求人情報の読み込みに失敗しました。";
      list.appendChild(li);
    });
});
