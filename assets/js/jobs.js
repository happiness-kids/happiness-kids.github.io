/* assets/js/jobs.js
   採用情報一覧の表示制御
   - jobs.csv を取得して期間内の求人のみ表示
   - 表示対象がない場合はメッセージを表示
*/

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("recruit-list");
  if (!list) return;

  fetch("../assets/csv/jobs.csv")
    .then((res) => {
      if (!res.ok) throw new Error("fetch failed");
      return res.text();
    })
    .then((text) => {
      const jobs = parseCSV(text);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const active = jobs.filter((job) => {
        const start = new Date(job["掲載開始日"]);
        const end   = new Date(job["掲載終了日"]);
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
        const li = document.createElement("li");
        li.className = "recruit-item";

        const title = document.createElement("a");
        title.href      = job["リンク先ファイル名"];
        title.textContent = job["募集職種名"];
        title.className = "recruit-title";

        const comment = document.createElement("p");
        comment.className = "recruit-comment";
        comment.textContent = job["コメント"];

        const btn = document.createElement("a");
        btn.href      = job["リンク先ファイル名"];
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

/* シンプルなCSVパーサー（ヘッダー行あり・ダブルクォート対応） */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  return lines.slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = splitCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? "";
      });
      return obj;
    });
}

function splitCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
