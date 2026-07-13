recruitページ改修仕様

# assets/data/jobs.json
表示する求人・詳細ページの内容は、1つのJSONファイルで一元管理する。
assets/data/jobs.json

配列の各要素（求人1件）が持つ項目：
filename, title, employment, start, end,
salaryType, salaryMin, salaryMax, salaryNote,
intro, jobContent, requirements, preferred, hours, holidays,
comment, metaDesc

- filename には .html を含めない
- 配列の並び順がそのまま一覧の表示順
- 求人一覧ページ（recruit/index.html）・各求人詳細ページ（recruit/job-*.html）ともに、この1ファイルを唯一のデータソースとする

上記内容は、求人ページ生成ブラウザアプリ（tools/job-generator.html）上で入力・管理する。


# jobs.js
jobs.json内の掲載開始日〜掲載終了日の期間内の求人のみ一覧表示する。
掲載開始日より前は非表示。
掲載開始日から掲載終了日まで表示。
掲載終了日が過ぎると非表示。
表示するものがない場合は、その旨を表示。

上記の動きはJSで管理する。
assets/js/jobs.js


# common.css
common.cssに09 Page - recruit | 採用情報ページ |を追加し、そこに記載する。

各採用情報詳細ページのCSSもここに記載する。

index.html（recruit/index.html）各採用詳細ページのページ全体の見え方は、contact/index.htmlやdisclosure/index.htmlを継承
　ヘッダー、フッターリンク、フッター　ページの配色、カード構成など


# 各採用情報詳細ページ（recruit/job-*.html）
assets/data/jobs.json の内容から、assets/js/job-html-template.js の generateHTML() で自動生成される静的HTMLファイル。
Googleしごと検索用の構造化データ（JSON-LD）を各ページに直接埋め込むため、共通テンプレートページ化はせず、求人ごとに個別のHTMLファイルとして生成・配置する。
フッターボタンは、「採用情報（recruit/index.html）」のみ。

手動で内容を書き換えず、必ず jobs.json を更新してから再生成すること（下記参照）。


# job-html-template.js（HTML生成テンプレート）
求人詳細ページのHTML生成ロジックを1箇所にまとめた共有スクリプト。
assets/js/job-html-template.js

ブラウザ（tools/job-generator.html が <script src> で読み込み）と、
Node.js（scripts/regenerate-pages.js が require で読み込み、GitHub Actionsが実行）の
両方から同じ実装を使うことで、一覧用データと詳細ページの内容がズレないようにしている。


# GitHub Actions による詳細ページの自動再生成
.github/workflows/regenerate-job-pages.yml

assets/data/jobs.json が main ブランチにpushされると自動的に起動し、
scripts/regenerate-pages.js を実行してrecruit/job-*.html を全件再生成、
差分があれば github-actions[bot] として自動でcommit・pushする。

jobs.json を更新する経路（job-generator.htmlからのアップロードでも、gitでの直接編集でも）を問わず、
詳細ページは必ず自動で最新化される。


# job-generator.html（求人ページ管理ツール）
ブラウザアプリの形で動く。
このページで行うことは、大きく３つ
・新しい採用情報詳細ページの作成
・jobs.jsonの管理
・作成したページのダウンロード

・新しい採用情報詳細ページの作成
各項目に順に記載し、決定ボタンを押すことで新しい求人ページを生成する。
過去の求人情報を選択することで、その内容が各入力欄に入力、編集可能な状態になる。

・jobs.jsonの管理
job-generator.htmlを開くと、GitHub上のjobs.jsonを自動取得する。
- ブラウザに保存済みの内容が無い場合（新しいPCで開いた場合）は、GitHubの内容をそのまま採用する。
- ブラウザに保存済みの内容とGitHub上の内容が一致していれば、そのまま編集を続けられる。
- 内容が食い違っている場合は、求人ごとに「ローカルを使う」「GitHubを使う」を選ばせる警告画面を表示し、無言で上書きしない。
編集して、「jobs.jsonをGitHubにアップロード」を押すとアップロードされ、詳細ページはGitHub Actionsが自動で更新する。

・作成したページのダウンロード
各項目を入力して、ファイル名を入力すると決定ボタンを押せるようになる。
決定ボタンを押すと、生成されたファイルがダウンロードされる。
