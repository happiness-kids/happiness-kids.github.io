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
1. `disclosure/files/` に PDF ファイルを追加
2. `disclosure/files.json` にエントリを追記

```json
[
  { "title": "資料タイトル", "file": "files/filename.pdf" }
]
```
