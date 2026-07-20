recruitページ改修仕様

# assets/data/jobs.json（求人ごとのデータ）
表示する求人・詳細ページの内容は、1つのJSONファイルで一元管理する。
assets/data/jobs.json

配列の各要素（求人1件）が持つ主な項目：
- 必須系：filename, title, employment, start, end, salaryType, salaryMin, salaryMax
- 任意系（フォームのチェックで記載可否を選択、空なら出力に出ない）：
  intro, point, keywords, jobContent, requirements, preferred, suitableFor,
  raiseBonus, allowances, hours, workSystem, holidays, longHoliday,
  staffVoice, recruiterMessage, comment, hwNumber, metaDesc,
  eduEnabled/eduCredentials/expEnabled/expMonths/expInPlaceOfEdu
- 共通項目の求人別上書き（空ならprofile.jsonの共通値を使う）：
  appealOverride, benefitsOverride, trainingOverride, selectionProcessOverride

- filename には .html を含めない
- 配列の並び順がそのまま一覧の表示順
- keywords（特徴・歓迎キーワード）は空白区切りで入力し、詳細ページ/descriptionでは「・」区切りの自然文で表示する（#やタグ機能ではない）
- raiseBonus 未設定で旧 salaryNote がある場合は、後方互換で salaryNote を昇給・賞与として扱う
- hwNumber（ハローワーク求人番号）は任意項目。入力時のみ詳細ページの「応募方法」にハローワーク応募案内を表示する
- 求人一覧ページ（recruit/index.html）・各求人詳細ページ（recruit/job-*.html）ともに、この1ファイルを唯一のデータソースとする

項目の全体像・出力順序・設計意図は docs/job-posting-description-spec.md 第7章を参照。
上記内容は、求人ページ生成ブラウザアプリ（tools/job-generator.html）上で入力・管理する。


# assets/data/profile.json（全求人で共通のプロフィール）
会社名・住所・電話・メール・担当者・施設情報（施設形態・定員・対象・スタッフ構成・設立・営業日・送迎）、
および「職場の特徴・支援方針／福利厚生／教育・研修体制／選考の流れ」の共通初期値を持つ唯一の管理点。
従来 job-html-template.js にハードコードしていた会社情報もここへ移設済み。

- tools/job-generator.html の「共通プロフィール」タブで編集し、jobs.json と同じ要領でGitHubへアップロードする
- 各求人ページの施設情報・勤務地・応募先・共通文面は、この profile.json から自動で埋め込まれる
- 上記の共通4項目は、求人ごとに `<key>Override` で個別上書き可能（フォームの「共通に戻す」ボタンで解除）


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
assets/data/jobs.json（求人別データ）と assets/data/profile.json（共通プロフィール）から、
assets/js/job-html-template.js の generateHTML(v, profile) で自動生成される静的HTMLファイル。
Googleしごと検索用の構造化データ（JSON-LD）を各ページに直接埋め込むため、共通テンプレートページ化はせず、求人ごとに個別のHTMLファイルとして生成・配置する。
フッターボタンは、「採用情報（recruit/index.html）」のみ。

手動で内容を書き換えず、必ず jobs.json / profile.json を更新してから再生成すること（下記参照）。


# job-html-template.js（HTML生成テンプレート）
求人詳細ページのHTML生成ロジックを1箇所にまとめた共有スクリプト。
assets/js/job-html-template.js

ブラウザ（tools/job-generator.html が <script src> で読み込み）と、
Node.js（scripts/regenerate-pages.js が require で読み込み、GitHub Actionsが実行）の
両方から同じ実装を使うことで、一覧用データと詳細ページの内容がズレないようにしている。

buildSections(v, profile) が「出力順序」と「内容」を1か所で定義し、そこから
①JobPostingの description（Googleしごと検索の詳細パネル用の長文求人票）と
②表示ページのHTML本文 の2つを同じデータから生成する（単一ソース・2出力）。
description はもう metaDesc の使い回しではなく、この buildSections() の結果。


# GitHub Actions による詳細ページの自動再生成
.github/workflows/regenerate-job-pages.yml

assets/data/jobs.json / assets/data/profile.json / assets/js/job-html-template.js のいずれかが
main ブランチにpushされると自動的に起動し（加えて毎日0時UTCのcronでも実行）、
scripts/regenerate-pages.js を実行してrecruit/job-*.html を全件再生成、
差分があれば github-actions[bot] として自動でcommit・pushする。

jobs.json / profile.json を更新する経路（job-generator.htmlからのアップロードでも、gitでの直接編集でも）を問わず、
詳細ページは必ず自動で最新化される。


# job-generator.html（求人ページ管理ツール）
ブラウザアプリの形で動く。タブは「求人一覧／求人編集／ファイル出力／共通プロフィール」の4つ。
（旧「ハローワーク」タブ＝入力用テキスト生成は廃止済み）
このページで行うことは、大きく４つ
・新しい採用情報詳細ページの作成
・jobs.jsonの管理
・共通プロフィール（profile.json）の管理
・作成したページのダウンロード

・新しい採用情報詳細ページの作成
各項目に順に記載し、決定ボタンを押すことで新しい求人ページを生成する。
必須以外の各項目はチェックボックスで「記載する／しない」を選べる。
共通項目（職場の特徴・福利厚生・研修・選考の流れ）は profile.json を既定値とし、
各求人で個別に上書き可能（「共通に戻す」ボタンで解除）。
既存の求人は「編集」で読み込めるほか、「複製」で内容を引き継いだ新規作成もできる。

・jobs.jsonの管理
job-generator.htmlを開くと、GitHub上のjobs.jsonを自動取得する。
- ブラウザに保存済みの内容が無い場合（新しいPCで開いた場合）は、GitHubの内容をそのまま採用する。
- ブラウザに保存済みの内容とGitHub上の内容が一致していれば、そのまま編集を続けられる。
- 内容が食い違っている場合は、求人ごとに「ローカルを使う」「GitHubを使う」を選ばせる警告画面を表示し、無言で上書きしない。
編集して、「jobs.jsonをGitHubにアップロード」を押すとアップロードされ、詳細ページはGitHub Actionsが自動で更新する。

・共通プロフィール（profile.json）の管理
「共通プロフィール」タブで、会社・施設情報や共通の初期値を編集する。
開くとGitHub上のprofile.jsonを自動取得し、「保存してGitHubにアップロード」で反映する。
profile.jsonが変わると、全求人の詳細ページがGitHub Actionsで自動再生成される。

・作成したページのダウンロード
各項目を入力して、ファイル名を入力すると決定ボタンを押せるようになる。
決定ボタンを押すと、生成されたファイルがダウンロードされる。
