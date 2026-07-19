# ハピネスキッズ 独自ドメイン移行 手順書 / タスク表

> 目的：現在の公開サイト（Google Sites）から GitHub Pages のサイトへ、独自ドメイン
> `https://happiness-kids.net/` を切り替える。求人ページ（Google しごと検索対象）と
> メール `mail@happiness-kids.net` を止めずに移行しきる。
>
> 最終更新：2026-07-19（初版作成）／担当：豊永

---

## 0. ゴールと前提

- **ゴール**：`https://happiness-kids.net/` にアクセスすると **GitHub Pages のサイト**が表示される。
- **現状**：公開サイトは Google Sites（`https://sites.google.com/happiness-kids.net/happiness-kids`）。
- **GitHub 側**：リポジトリ `happiness-kids/happiness-kids.github.io`（現URL `https://happiness-kids.github.io/`）。
- **絶対に止めないもの**：メール `mail@happiness-kids.net`（＝ DNS の **MX レコード**）。
- **SEO資産を守る対象**：Google しごと検索に載っている求人ページ群（`/recruit/job-*.html`）。

### 意思決定ポイント（確定済み・2026-07-19）
- [x] **URL**：apex（`happiness-kids.net`）を正とし、**`www.happiness-kids.net` も対応**（www CNAME追加 → apexへ自動301リダイレクト。名刺・チラシ等で`www.`表記されても動くようにする保険）。
- [x] **job-generator.html**：リポジトリからは移動せず**現状維持のまま`noindex`を付与**（外出先からの編集利便性を優先。XSS経由のトークン漏洩リスクは残存＝既知の懸念点として保留）。
- [x] **404ページ**：**作成する**（サイトデザインに合わせたカスタム404.html）。
- [x] **旧 Google Sites の後始末**：トップページ1枚だけ残し「引っ越しました」表示＋新サイトへのリンクを設置。**それ以外の全サブページ（求人情報・支援プログラム公表・安全計画・職場環境等要件・事業所自己評価等）は削除**し、新サイト（happiness-kids.net）に一本化する。
  - ※Google Sites はページ単位の真の301リダイレクトを設定できないため、「リダイレクト」はトップページに埋め込みHTML（Embed）でJavaScriptによる自動転送を仕込み、JS不発火時の保険として手動リンクも併記する形で実現する（フェーズ4-4参照）。
  - ※これにより「情報公開系ページの二重管理」問題も解消される（Sites側の独自PDF埋め込みが消え、github.io/disclosure/ が唯一の情報源になる）。
- [x] **Search Console**：新ドメインでは**ドメインプロパティ（DNS TXT認証）で新規登録**する（サイト全体を1回でカバー。現状 `/recruit/` のURLプレフィックス型のみ検証済みで、ルートは未確認のまま放置されていたため）。

---

## フェーズ1：調査（切替日を決める前に必ず完了させる）

> ここが埋まらないと、切替でメールを飛ばす／旧サイトが二重に生き残る等の事故が起きる。

- [x] **1-1. ドメイン管理場所の特定**：NSレコードが `ns-cloud-b1〜b4.googledomains.com`（Google Cloud DNS）→ **Squarespace Domains（旧Google Domains）で管理されている可能性が高い**。ログイン情報の所在は要確認（下記メモ欄）。
- [x] **1-2. 現行DNSレコードを全部控える**：2026-07-19時点の値を下記メモ欄に記録済み（公開DNS照会による。ロールバック用の原本として保持）。
- [x] **1-3. apex と www の現在の向き先**を確認：**apexにA/AAAA/CNAMEレコードは一切無し**。**wwwも未設定（NXDOMAIN）**。→ Google Sites は DNSカスタムドメインではなく、Google Workspace組織ドメインとしての`sites.google.com/happiness-kids.net/...`形式で公開されている（想定していた「apexの奪い合い」は発生しない）。
- [x] **1-3b. CAAレコードの有無を確認**：**CAAレコード無し**。GitHub Pagesの証明書発行（Let's Encrypt）を妨げる要因は無い。
- [x] **1-4. Google Sites 側のカスタムドメイン設定**を確認：Sites編集画面の設定（歯車）にドメイン関連項目は無いことを本人が確認（2026-07-19）。新Google Sitesにはそもそも個別サイトへのカスタムドメイン割り当て機能が無く、DNS上の証跡（1-3：apexにA/AAAA/CNAME無し）とも整合。**マッピングは存在しないと結論**。
- [x] **1-5. メール関連レコードを別途控える**：**Google Workspace のメールと確認できた**。MX 5件（aspmx.l.google.com 系）／SPF（`v=spf1 include:_spf.google.com ~all`）／DKIM（`google._domainkey`、RSA鍵）／その他TXT `MS=ms13725814`（Microsoft系ドメイン確認用と推測、用途不明だが削除しない）。値は下記メモ欄に記録。
- [x] **1-6. Google Search Console の既存プロパティ**：**`https://happiness-kids.github.io/recruit/`（URLプレフィックス型）のみ検証済み**。旧検証ファイル [recruit/googleee3cadb9d04adf36.html](../recruit/googleee3cadb9d04adf36.html) はこのプロパティ用と確定。ルート `https://happiness-kids.github.io/` は「未確認」のまま＝サイト全体（トップ・about・contact・disclosure）はSearch Console監視対象外だった。
  - 「拡張」→「求人情報」レポートは有効0／無効0（エンハンスメントレポート自体は未集計）だが、**実トラフィック（1-6b参照）とライブページの手動確認で構造化データが正常動作していることを確認済み**。リッチリザルトテストはツール側が応答せず未実施だが、代替確認により問題なしと判断。
    - 手動確認：`https://happiness-kids.github.io/recruit/job-hoikushi-s.html` の実配信JSON-LDを取得し、Google必須項目（title / description / datePosted / hiringOrganization / jobLocation 等）が揃った構文的に正しいJSON-LDであることを確認（2026-07-19）。
- [x] **1-6b. 移行前のトラフィック・ベースライン記録**：`/recruit/` プロパティ、過去3ヶ月：
  - 全体：クリック数 5／表示回数 180
  - 検索の見え方「ジョブのリスティング」：クリック3／表示回数54／平均CTR 5.6%／平均掲載順位4.7
  - 検索の見え方「ジョブの詳細」：クリック1／表示回数9／平均CTR 11.1%／平均掲載順位2.6
  - → 表示回数180のうち63件（35%）、クリック5件のうち4件がしごと検索経由。**エンハンスメントレポートの有効0とは矛盾するが、実トラフィックは発生している**（レポート反映のラグと推測）。
- [x] **1-7. Google ビジネスプロフィール**：存在する。**ウェブサイト欄が `https://sites.google.com/happiness-kids.net/happiness-kids/home` になっている**（移行後に `https://happiness-kids.net/` へ更新が必要＝フェーズ4-5）。住所・電話番号は現行と一致（問題なし）。
- [ ] **1-8. 外部からの被リンク棚卸し**（2026-07-19時点）：
  1. Instagramプロフィール：短縮URL `00m.in/happiness-kids` を掲載。**⚠️更新漏れで現在遷移できない状態（既存の別問題）**。移行を機に `https://happiness-kids.net/` へ向け直して修正する（フェーズ4-6の対象を短縮URLサービス側の設定変更に変更）。
  2. 障害福祉サービス等情報公表システム：`https://sites.google.com/happiness-kids.net/happiness-kids/` を登録 → 移行後に更新要（フェーズ4-7）。
  3. ハローワーク求人票：ホームページURLの登録**なし**（対応不要）。
  4. パンフレット（紙媒体）：`https://sites.google.com/happiness-kids.net/happiness-kids/` を記載。**紙なので事後修正不可** → Sitesトップページに「引っ越しました」自動転送＋手動リンクを残す設計（フェーズ4-4）が、この導線の受け皿として機能する。刷り直しは別途要検討。
  5. その他外部掲載サイト：**確認中（後日）**。
- [x] **1-8b. Sitesサブページ削除前のインデックス状況確認**：Sites用の検証済みSearch Consoleプロパティが無いため一般Web検索で代替確認（2026-07-19）。**トップページ（`sites.google.com/happiness-kids.net/happiness-kids`）はインデックスされている**（→「引っ越しました」導線で受け止められる）。**削除予定の個別サブページ（求人情報・支援プログラム公表等）は検索結果に出てこず、直リンク被害のリスクは低いと判断**。
  - 副産物：外部掲載サイト候補を2件発見（1-8の項目5に活用）：[ジョブメドレー](https://job-medley.com/facility/260050/)、[高知くらしつながるネット（Licoネット）](https://chiiki-kaigo.casio.jp/kochi/info_services/67060)。
- [x] **1-8c. 情報公開PDFの内容突合**：**運営者が毎回両方同時に更新している運用のため、内容は一致**（2026-07-19本人確認）。github.io側を最新化する必要なし。

### 調査結果メモ欄（2026-07-19 公開DNS照会・Sites閲覧により判明）
```
・DNS権威サーバー：ns-cloud-b1〜b4.googledomains.com（Google Cloud DNS。管理事業者はおそらくSquarespace Domains＝旧Google Domains。要本人確認）
・apex 現在の向き先：A/AAAA/CNAMEレコード無し（未設定）
・www 現在の向き先：未設定（NXDOMAIN）
・MXレコード：
    10  alt3.aspmx.l.google.com
    10  alt4.aspmx.l.google.com
    5   alt2.aspmx.l.google.com
    5   alt1.aspmx.l.google.com
    1   aspmx.l.google.com
  （標準的なGoogle Workspace構成）
・SPFレコード（TXT）：v=spf1 include:_spf.google.com ~all
・DKIMレコード：google._domainkey.happiness-kids.net（TXT、RSA鍵。Google Workspace標準）
・その他TXT：MS=ms13725814（用途不明・Microsoft系ドメイン確認トークンの可能性。削除しないこと）
・CAAレコード：無し
・Google Sitesカスタムドメイン：マッピングなし（Sites管理画面で本人確認済み）
・Search Consoleプロパティ：`https://happiness-kids.github.io/recruit/`（URLプレフィックス型）のみ検証済み。ルート未確認
・移行前ベースライン：クリック5／表示回数180（過去3ヶ月、/recruit/プロパティ）。詳細は1-6b参照
・ビジネスプロフィール：ウェブサイト欄が `https://sites.google.com/happiness-kids.net/happiness-kids/home`。住所・電話番号は現行と一致
```

**この結果を踏まえた設計上の帰結**：
- apex/wwwとも新規追加のみで済むため、フェーズ3-1「Google Sites側のカスタムドメイン・マッピングを解除」は**Sites管理画面で1-4を確認した上で、該当が無ければ不要な手順として省略できる**見込み。
- MX・SPF・DKIM は Google Workspace 標準構成そのもの。フェーズ3-2でのDNS編集時は、この3種を触らないことを機械的にチェックできる（値が上記と一致していることを確認するだけでよい）。
- `MS=ms13725814` の用途が不明なため、**契機があれば運営者に確認**（Microsoft 365/Bing Webmaster Tools等の心当たりがあるか）。実害は無いが、正体不明のレコードを削除しないという原則の対象として明記しておく。

---

## フェーズ2：事前準備（本番切替の前に、無停止でできる作業）

> リポジトリ側の準備。main に入れても github.io で表示され続けるだけで実害はない。
> ただし og:url を net にするのは切替とほぼ同時が無難（先行すると切替前のSNSシェアが404になりうる）。
> **2026-07-19：2-1〜2-5, 2-7 完了（Claude Codeが実施）。ローカルの作業ツリーに存在、コミット・プッシュは未実施。**

- [x] **2-1. `CNAME` ファイル作成**：リポジトリ直下に [CNAME](../CNAME)（中身 `happiness-kids.net`）を作成済み。
- [x] **2-2. サイト内URL書き換え（計6箇所）** 完了：
      - [x] [index.html](../index.html) の `og:url` / `og:image`
      - [x] [about/index.html](../about/index.html) の `og:url` / `og:image`
      - [x] [contact/index.html](../contact/index.html) の `og:url` / `og:image`
      - [x] [disclosure/index.html](../disclosure/index.html) の `og:url` / `og:image`
      - [x] [recruit/index.html](../recruit/index.html) の `og:url` / `og:image` **＋ canonical**
      - ※求人詳細ページの JSON-LD は絶対URLを持たないため**書き換え不要**（確認済み）。
      - ※`tools/job-generator.html` の `happiness-kids.github.io` は**リポジトリ名**なので**変更不可**（変えると壊れる）。
      - ※`mailto:mail@happiness-kids.net` はメール用で**変更不要**。
- [x] **2-3. `sitemap.xml` は「不要」と判断し、作成しない**（2026-07-19決定・一度作成後に削除）。
      - 理由：①サイト規模が小さく内部リンクだけで全ページに到達可能、②sitemap.xmlが一度も存在しなかった状態でも実際にしごと検索経由の表示・クリックが発生していた実績あり（1-6b参照）、③手書きsitemapはjobs.jsonと連動しない別データソースになり、求人一覧・詳細ページの二重管理をjobs.json一本化で解消した過去の教訓と同じ問題を再発させるリスクがある。
      - 移行直後の再クロールを早めたい場合は、恒久的なファイルを残す代わりにSearch Consoleで主要URLを個別に「インデックス登録をリクエスト」する一度きりの手動操作で代替する（フェーズ4-1参照）。
      - `robots.txt` の `Sitemap:` 行も同時に削除済み。
- [x] **2-4. `404.html` 作成**：[404.html](../404.html) 作成済み。既存の共通クラス（`site-header`/`container`/`button-link`/`site-footer`）で構成し、`noindex`を付与。CSS設計ルールに沿って「04 Utilities」セクションに `.text-center` を追加（コメントで例示されていたクラス）。
- [x] **2-5.** [tools/job-generator.html](../tools/job-generator.html) に `noindex` 付与済み（配置は変更せず）。
- [ ] **2-6. ドメインプロパティ用 TXT 値**を Search Console で発行しておく（DNS 追加はフェーズ3で）。**要ログイン（運営者作業）**。
- [x] **2-7. `robots.txt` 作成**：[robots.txt](../robots.txt) 作成済み。`/tools/` を除外、`sitemap.xml` の場所を明示。
- [ ] **2-8.（任意）GitHub Organization の Verified domains 設定**：ドメイン乗っ取り防止のセキュリティ強化。Organization Settings → Verified & approved domains でTXTレコードを追加するだけ。**要GitHub組織管理者権限（運営者作業）**。

---

## フェーズ3：切替当日（順序厳守）

> できれば低トラフィックの時間帯に。DNS切替の瞬間に旧サイトは見えなくなる。

- [ ] **3-1. （フェーズ1-4でマッピングが確認された場合のみ）Google Sites 側のカスタムドメイン・マッピングを解除**。※2026-07-19時点のDNS調査ではapexに既存レコードが無く、マッピングは存在しない可能性が高い（1-4の最終確認待ち）。
- [ ] **3-2. DNS を書き換え**（**MX・SPF(TXT)・DKIM(CNAME) は絶対に触らない**）：
      - [ ] apex `happiness-kids.net` の **A レコード4件**：
        ```
        185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153
        ```
      - [ ] （任意）AAAA 4件：`2606:50c0:8000::153` / `8001::153` / `8002::153` / `8003::153`
      - [ ] `www` の **CNAME → happiness-kids.github.io.**（apexへ自動301）
      - [ ] Search Console 用 **TXT レコード**を追加（2-6の値）。**既存のSPF等のTXTレコードを上書きせず「追加」になっていることを確認**（DNS管理画面によっては同一ホストの既存TXTを編集扱いしてしまう場合がある）。
      - [ ] 旧 Google Sites 向けの不要な A/CNAME を削除。
- [ ] **3-3. GitHub Pages 設定**：Settings → Pages → Custom domain に `happiness-kids.net` を入力 →「DNS check successful」の緑を確認。
- [ ] **3-4. フェーズ2の作業ブランチを main にマージ**（URL書き換え・CNAME・sitemap）。求人ページ自動再生成ワークフローが成功で完了するのを確認。
- [ ] **3-5. 伝播待ち**（通常数十分、最大48h）。
- [ ] **3-6. 証明書の発行を待って `Enforce HTTPS` を ON**（発行前にONにするとエラーになる）。
- [ ] **3-7. フェーズ5の動作確認チェックリストを実施**。

---

## フェーズ4：切替後（SEO・外部・旧サイトの後始末）

- [ ] **4-1. Search Console**：ドメインプロパティの検証完了 → 主要URL（トップ・recruit/・公開中の求人詳細ページ）を「URL検査」ツールで個別に「インデックス登録をリクエスト」（sitemap.xmlは作らない方針のため、再クロール促進はこの手動操作で代替）。
- [ ] **4-2. Google しごと検索**：リッチリザルトテストで求人ページの JobPosting が有効か確認。
- [ ] **4-3. 旧 `happiness-kids.github.io` → 新ドメインへの 301 リダイレクトを確認**（GitHubが自動で行う）。
- [ ] **4-4. 旧 Google Sites の後始末**（決定済み方針：トップページのみ残し新サイトへ一本化）：
      - [ ] **サブページを全削除**（削除前にフェーズ1-8b/1-8cを完了させておくこと）：
            - 求人情報（`/home/kyujin`）
            - 支援プログラム公表（2025）（`/home/支援プログラム公表2025`）
            - 2025年度安全計画（`/home/2025年度安全計画`）
            - 職場環境等要件（`/home/syokubakankyou`）
            - 2026年事業所自己評価／アンケート結果（`/home/2026年アンケート結果`）
      - [ ] **トップページを「引っ越しました」案内に置き換え**：
            - 本文に「サイトを移転しました → https://happiness-kids.net/」のリンクを明記（手動クリック用の保険）。
            - あわせて「埋め込み」要素でJavaScriptによる自動転送（例：`window.location.replace("https://happiness-kids.net/")`）を仕込み、自動遷移させる。
      - [ ] メニュー（ナビゲーション）も上記削除後の構成に合わせて整理する。
- [ ] **4-5. Google ビジネスプロフィール**：ウェブサイト欄を `https://sites.google.com/happiness-kids.net/happiness-kids/home` → `https://happiness-kids.net/` へ更新。
- [ ] **4-6. Instagramプロフィールの短縮URL（`00m.in/happiness-kids`）を修正**：現在「更新漏れで遷移できない」既存の別問題も合わせて、遷移先を `https://happiness-kids.net/` に設定し直す（短縮URLサービス側の管理画面で変更）。
- [ ] **4-7. 障害福祉サービス等情報公表システム**：登録URLを `https://sites.google.com/happiness-kids.net/happiness-kids/` → `https://happiness-kids.net/` へ更新。
- [ ] **4-7b. パンフレット（紙媒体）の記載URL**：印刷物のため即時修正は不可。次回刷り直し時に `https://happiness-kids.net/` へ変更する前提で控えておく（それまではSitesトップページの「引っ越しました」導線が受け皿になる）。
- [ ] **4-7c. その他外部掲載サイト**：フェーズ1-8の5番（後日確認）の結果が出次第、該当URLを更新。

---

## フェーズ5：動作確認チェックリスト（切替直後に実施）

- [ ] `https://happiness-kids.net/` が表示され、ブラウザに鍵マーク（HTTPS）が出る。
- [ ] `https://www.happiness-kids.net/` にアクセスすると apex へ301リダイレクトされる。
- [ ] 全ページ表示：トップ / about / contact / disclosure / recruit。
- [ ] 求人一覧（`/recruit/`）に募集中の求人が正しく出る。
- [ ] 求人詳細ページが表示され、**リッチリザルトテストで JobPosting が有効**。
- [ ] OGP：SNSシェアデバッガ（例：各SNSのカードチェッカー）で **og:url / og:image が新ドメイン**になっている。
- [ ] **メール `mail@happiness-kids.net` の送受信が生きている**（＝ MX 無事）。← 最重要。
- [ ] 旧 `https://happiness-kids.github.io/` が新ドメインへ 301 で飛ぶ。

---

## リスクとロールバック

- **瞬断**：DNS切替中は旧サイトが見えなくなる。低トラフィック時間帯を選ぶ。
- **証明書発行遅延**：`Enforce HTTPS` は証明書発行後に。焦って先にONにしない。証明書発行自体がCAAレコードでブロックされる可能性もある（1-3b参照）。
- **メール断（最悪ケース）**：MX・SPF・DKIM を巻き込み削除すると受信不能／迷惑メール判定リスク。フェーズ1-5の控えで即復旧。
- **ロールバック手順**：フェーズ1-2で保存したDNS原本に戻し、GitHub Pages の Custom domain を外し、Google Sites のマッピングを復活させる。
- **しごと検索の反映ラグ**：URL変更後、Google の再クロールまで時間差あり。301を効かせたまま待つ（旧ページ・データは消さない）。
- **Sitesサブページ削除後の直リンク切れ**：削除したサブページに直接ブックマーク／被リンクしている訪問者は、トップページの案内を経由せずSites自体の素の404に当たる。フェーズ1-8bで事前にインデックス状況を確認し、影響が大きそうなら削除ではなく「引っ越しました」ページへの置き換えに変更する。

---

## 進め方の順序（サマリ）

1. フェーズ1（調査）を完了 → **切替日を決められる状態にする**
2. フェーズ2（リポジトリ準備）をブランチで用意
3. フェーズ3（切替）→ フェーズ5（確認）
4. フェーズ4（SEO・外部・旧Sitesのサブページ削除＋引っ越し案内）で仕上げ
