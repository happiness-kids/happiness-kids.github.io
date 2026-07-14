# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## サイト概要

放課後等デイサービス「ハピネスキッズ」（高知市）の公式Webサイト。GitHub Pages で静的ホスティング。ビルドツール・パッケージマネージャー・テストフレームワークは一切なし。

**運営会社：** 合同会社足人
**現在の公開URL：** `https://happiness-kids.github.io/`
**移行予定ドメイン：** `https://happiness-kids.net/`

## ドメイン移行時にやること

独自ドメイン（`happiness-kids.net`）に移行する際は、以下を対応すること。

- `recruit/index.html` の canonical タグを書き換える
  ```html
  <!-- 移行後 -->
  <link rel="canonical" href="https://happiness-kids.net/recruit/">
  ```

- 全ページの OGP タグ（`og:url` と `og:image`）を書き換える。対象ファイルと書き換え内容：

  | ファイル | og:url | og:image |
  |---|---|---|
  | `index.html` | `https://happiness-kids.net/` | `https://happiness-kids.net/assets/images/icon.png` |
  | `about/index.html` | `https://happiness-kids.net/about/` | 同上 |
  | `contact/index.html` | `https://happiness-kids.net/contact/` | 同上 |
  | `disclosure/index.html` | `https://happiness-kids.net/disclosure/` | 同上 |
  | `recruit/index.html` | `https://happiness-kids.net/recruit/` | 同上 |

## CSS設計ルール（common.css v4）

`assets/css/common.css` がサイト全体のスタイルを管理。以下のセクション構成を維持すること：

| セクション番号 | 用途 |
|---|---|
| 01 Base / Reset | 全体基本設定・カラー／スペーシング変数 |
| 02 Layout | header・footer・container |
| 03 Components | 再利用UIコンポーネント（button-link、card-section等） |
| 04 Utilities | 汎用クラス（将来拡張用） |
| 05 Page - index | トップページ専用スタイル |
| 06 Page - about | 施設紹介ページ専用スタイル |
| 07 Page - contact | お問い合わせページ専用スタイル |
| 08 Page - disclosure | 情報公開ページ（将来実装） |
| 09 Page - recruit | 採用情報ページ・求人詳細ページ専用スタイル |

**保守ルール：**
- 新しいUIは「03 Components」へ追加
- ページ固有スタイルは対応番号のセクションへ追加
- 余白は `:root` 変数（`--space-section`、`--space-card`、`--space-gap`、`--space-small`）を使用
- 色・角丸は直接書かず変数を使用（`--main-color`、`--accent-color`、`--radius-card`、`--radius-large` 等）

## CSS適用対象ページとスタンドアロンページ

`common.css` を読み込むページ：`index.html`、`about/index.html`、`recruit/index.html`、`recruit/job-*.html`（job-generator.htmlが自動生成する求人詳細ページ）

スタンドアロンCSS（`<style>` タグ内に独自スタイルを持つ）：`recruit/job-hoikushi-jidoushidouin.html`（自動生成の仕組みより前に作られたレガシーページ）、`tools/job-generator.html`

## 求人情報（recruit）の仕組み

`assets/data/jobs.json` が求人一覧・詳細ページ共通の唯一のデータソース。`assets/js/jobs.js` が一覧ページ用に読み込み、`assets/js/job-html-template.js`（ブラウザの`tools/job-generator.html`とNode.jsの`scripts/regenerate-pages.js`の両方から共有）が詳細ページ（`recruit/job-*.html`）を生成する。`assets/data/jobs.json`がmainにpushされると`.github/workflows/regenerate-job-pages.yml`が自動的に詳細ページを再生成・commitする。詳しくは `recruit/recruit.md` を参照。

**掲載終了求人の扱い（2026-07-14〜）：**
- `scripts/regenerate-pages.js` は、掲載終了日を過ぎた求人でも `jobs.json` にエントリが残っている限りページを再生成し続ける（`noindex` を付与し、JobPosting構造化データは出力しない）。
- `jobs.json` からエントリが削除された場合のみ、対応する `recruit/job-*.html`（自動生成マーカー付きのファイルのみ）を削除する。
- ワークフローは jobs.json の変更時に加え、毎日0時（UTC）にも実行される（掲載終了日の到来だけでページを更新するため）。
- **この日次cronについての判断（2026-07-14）：** GitHub Actionsの`schedule`トリガーは、リポジトリに一定期間（目安90日）pushがないと自動的に無効化されることがある。無効化された場合、実質的に「jobs.json更新時のみ再生成」という状態に戻るだけであり、これは壊れているのではなく安全に降格しているだけと判断した。理由：GoogleのJobPosting構造化データは`validThrough`を見て自動的にしごと検索から除外するため、日次cronが止まっていても実害（しごと検索への表示継続）は起きない。そのため、`workflow_dispatch`（手動実行ボタン）やリマインダー通知の追加は不要と判断し、見送った。

**今後の実装予定：求人データのアーカイブ機構（未着手）**

現状、`tools/job-generator.html` の「削除」操作は `jobs.json` からエントリを完全に消す。掲載終了後にエントリを消すと、そのHTMLページも（上記の仕組みにより）削除され、過去の求人内容を参照する手段がなくなる。

今後、以下の方針で仕組みを作る予定（設計・実装は別途行う）：
- 掲載終了・削除された求人のデータは、サイト上には表示しない（一覧にも出さない・HTMLも公開しない）が、**運営者が後から参照・再利用できる形で保持**しておく（例：`jobs.json`とは別にアーカイブ用のJSONを設ける、または`jobs.json`内にアーカイブフラグを持たせる等）。
- 目的は、以前と同じ・似た求人を再度掲載する際に、過去の記載内容（仕事内容・給与・条件文言など）をコピー可能にすること。
- この方針が固まるまでは、運営者は掲載終了した求人エントリを `jobs.json` から安易に削除しないよう注意する（削除するとページも消え、参照できなくなるため）。

## Instagramセクションの仕組み

`about/index.html` の Instagram表示は以下の構成：

- `parts/instagram.txt` — Instagram公式の埋め込みHTMLを1件のみ記載して更新する
- `assets/js/instagram.js` — `DOMContentLoaded` 時に `parts/instagram.txt` をfetchし `#instagram-embed` に挿入。`<script>` タグは自動除去してから `embed.js` を動的ロードする
- `instagram.txt` が空（または空白のみ）の場合は `.about-instagram` セクション自体を削除して非表示

Instagram投稿を更新する際は `parts/instagram.txt` の内容を差し替えるだけでよい。

## 電話番号について

サイト内に2つの電話番号が存在するが、どちらも正しい。

- `088-802-1380` — 事業所（ハピネスキッズ）の電話番号
- `088-824-8810` — 法人代表（合同会社足人）の電話番号

## disclosure ページの仕組み

`disclosure/index.html` は `disclosure/files.json` を JavaScript で読み込んでPDFリンクを自動生成する。HTMLは触らずに運用できる。

**PDFを追加するときの手順：**
1. `disclosure/` に PDF ファイルを追加（`disclosure/index.html` と同じ階層）
2. `disclosure/files.json` にエントリを追記

```json
[
  { "title": "資料タイトル", "file": "filename.pdf" }
]
```

## 現在の懸念点（未対応・要検討）

サイト全体レビュー（2026-07-14）で見つかった問題のうち、優先度が高い3点（求人掲載開始日のタイムゾーンずれ／掲載終了後も求人詳細ページが残る問題／recruit/index.htmlのメタ情報欠落）は対応予定・対応済み。以下はそれ以外の未対応事項。

- **`recruit/index1.html` が旧デザインの残骸のまま公開されている**
  現行の `recruit/index.html` とは無関係の旧ページ。誰でも `/recruit/index1.html` でアクセス可能。内容も古い（Google Sites への外部リンク等）。削除を検討。

- **求人詳細ページ（`recruit/job-*.html`）に OGP・canonical がない**
  `assets/js/job-html-template.js` の `generateHTML()` が生成する head に OGP タグ・canonical タグが含まれていない。SNSシェア時のプレビューやSEO面で不利。

- **favicon が未設定**
  全ページで `<link rel="icon">` が指定されておらず、ブラウザタブにアイコンが出ない。`assets/images/icon.png` を流用可能。

- **`recruit/googleee3cadb9d04adf36.html`（Search Console確認ファイル）が `/recruit/` 配下にある**
  サイト全体でプロパティ登録しているなら、本来はルート直下に置くべき。登録単位を要確認。

- **`tools/job-generator.html`（求人管理ツール）が公開サイト上に存在する**
  `https://happiness-kids.github.io/tools/job-generator.html` として誰でも閲覧でき、管理画面の存在・操作方法・リポジトリ構成が外部に晒される。また GitHub Personal Access Token を同一オリジンの `localStorage` に保存しているため、将来サイトにXSSが発生した場合にトークン漏洩のリスクがある。リポジトリ外のローカル専用ファイルに移すか、最低限 `noindex` を付与すべき。

- **アクセシビリティの細部**
  Instagramの「続きを読む」ボタンに `aria-expanded` がない。`tools/job-generator.html` の `renderJobList()` / `showSyncConflict()` が求人タイトルを未エスケープで `innerHTML` に挿入している（自分のデータのみが対象のため実害は低いが、習慣として要改善）。
