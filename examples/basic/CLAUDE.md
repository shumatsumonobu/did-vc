# DID/VC Basic Demo 実装指示

## このディレクトリの目的
DID/VCの基本的な動作を理解するためのシンプルなデモ実装

## ファイル構成
```
examples/basic/
├── src/                    # 全ソースファイル（開発時）
│   ├── index.html          # メインエントリーページ
│   ├── holder/
│   │   ├── index.html
│   │   ├── credentials.html
│   │   └── presentation.html
│   ├── verifier/
│   │   └── index.html
│   ├── js/
│   │   ├── holder/
│   │   │   ├── index.js           # holder/index.html用
│   │   │   ├── credentials.js     # holder/credentials.html用
│   │   │   └── presentation.js    # holder/presentation.html用
│   │   ├── verifier/
│   │   │   └── index.js           # verifier/index.html用
│   │   └── lib/
│   │       ├── showLoadingFor.js  # 共通ローディング機能
│   │       ├── cryptoUtils.js     # 暗号化・署名・検証ユーティリティ
│   │       ├── didRegistry.js     # DID管理・解決・登録機能
│   │       └── vcManager.js       # VC生成・管理・検証機能
│   └── css/
│       └── style.css              # スタイルシート
├── dist/                   # ビルド済みファイル（本番用）
│   ├── index.html          # メインエントリーページ
│   ├── assets/
│   │   ├── js/
│   │   │   ├── holder-[hash].js   # バンドル済みholderファイル
│   │   │   └── verifier-[hash].js # バンドル済みverifierファイル
│   │   └── css/
│   │       └── main-[hash].css    # 圧縮済みCSS
│   ├── holder/
│   │   ├── index.html
│   │   ├── credentials.html
│   │   └── presentation.html
│   └── verifier/
│       └── index.html
├── package.json
├── vite.config.js         # ビルド設定
└── README.md              # デモ説明
```

## モジュール設計方針
- **src/js/lib/ディレクトリ** に共通機能モジュールを配置
- **src/js/holder/**, **src/js/verifier/** に各アプリ専用機能を配置
- **ES6モジュール** として実装（import/export使用）
- 実装時に必要に応じてモジュールを追加・調整

## UI/UXデザイン規則
- **フレームワーク**: Bootstrap 5 CDN使用
- **フォントサイズ**: 小さめ（0.8125rem）
  ```css
  :root {
    --bs-body-font-size: 0.8125rem;
    --bs-body-font-family: ui-sans-serif, system-ui, sans-serif;
  }
  ```
- **配色**: 高級感のある落ち着いた青ベース
  - Primary: #2c5aa0（青）
  - Secondary: #555（ダークグレー）
  - Text Muted: #222（濃いグレー）
  - ローディング: デジタルアニメーション対応
- **デザイン**: シンプルでプロフェッショナルな外観

## 技術仕様
### DID管理
- **Holder**: 初回起動時に自己生成（did:key:z6Mk...）
- **Issuer**: 固定値（did:demo:issuer-001）
- **Verifier**: DID不要

### データ管理
- **公開鍵**: LocalStorageの`did_registry`に保存
- **VC保存**: LocalStorageの`vc_wallet`
- **署名**: 疑似実装（デモ用）

### 実稼働との技術的違い
| コンポーネント | 実稼働 | デモ実装 |
|--------------|--------|----------|
| **DID解決** | 分散台帳（Ethereum, Hyperledger等） | LocalStorage |
| **暗号署名** | EdDSA, ECDSA, RSA | 疑似署名（文字列） |
| **鍵管理** | HSM, 暗号ウォレット | ランダム文字列 |
| **データ正規化** | JSON-LD Canonicalization | 簡易JSON |
| **相互運用性** | W3C標準完全準拠 | 構造のみ準拠 |

### 動作フロー
1. **VC発行**: Holderがフォーム入力 → 内部でIssuer処理 → 即座にVC発行
2. **VP提示**: 本人確認/年齢認証を選択 → 必要項目のみ抽出 → QRコード生成
3. **検証**: QRスキャン（リアカメラ自動起動） → 署名検証 → 結果表示

## Holder画面仕様
- **トップページ** (`src/holder/index.html`): 大きな2つのメニューカード
  - VC管理カード → `credentials.html`へ
  - VP提示カード → `presentation.html`へ
- **VC管理画面** (`src/holder/credentials.html`):
  - 申請フォーム（氏名、生年月日、住所、性別）
  - 発行済みVC表示（カードデザイン）
  - フッターナビゲーション
- **VP提示画面** (`src/holder/presentation.html`):
  - 本人確認VP（氏名・生年月日・住所）
  - 年齢認証VP（成人年齢証明のみ）
  - QRコード生成・表示機能

## Verifier画面仕様
- **認証アプリ** (`src/verifier/index.html`):
  - 認証シナリオ選択（本人確認・年齢認証）
  - リアカメラ自動起動によるQRスキャン
  - 認証結果表示（成功・失敗）
  - 開発用テストボタン

## 重要な実装原則
1. **HolderのDIDは自己生成** - Issuerは関与しない
2. **選択的開示は2種類のみ** - 本人確認と年齢認証
3. **検証にはIssuerの公開鍵のみ必要** - Holderの公開鍵は不要
4. **LocalStorageで完結** - 外部API不要
5. **QRコードは直接埋め込み** - 最大2-3KB

## 実装済み機能（モジュール化済み）
- **共通ライブラリ** (`src/js/lib/`):
  - `showLoadingFor.js`: ローディングアニメーション
  - `cryptoUtils.js`: 暗号化・署名・検証ユーティリティ
  - `didRegistry.js`: DID管理・解決・登録機能
  - `vcManager.js`: VC生成・管理・検証機能
- **Holder機能** (`src/js/holder/`):
  - `index.js`: ホームページ初期化
  - `credentials.js`: VC発行申請・管理機能
  - `presentation.js`: VP作成・QRコード生成
- **Verifier機能** (`src/js/verifier/index.js`): QRスキャン・認証処理
- **データ管理**: LocalStorageベースの簡易DIDレジストリ
- **QRコード**: 生成・読み取り機能

## HTMLでのモジュール使用例
```html
<script type="module">
  // 必要な機能をインポート
  import showLoadingFor from '../js/lib/showLoadingFor.js';
  // ...
</script>
```

## エラー処理
- 必須フィールドの検証
- QRコードサイズ制限のチェック
- LocalStorage使用可能性の確認
- 適切なエラーメッセージ表示

## 開発環境セットアップ

### 必要環境
- Node.js (v18以上推奨)
- npm または yarn

### セットアップ手順

```bash
# 1. 依存関係インストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザでアクセス
# http://localhost:5173 または http://localhost:5174
# (ポートが使用中の場合は自動で次のポートが使用されます)
```

### Vite設定
- **ビルドツール**: Vite v6.3.6
- **開発サーバー**: http://localhost:5173 (ポートが使用中の場合は自動で次のポートが使用されます)
- **ホットリロード**: ファイル変更で自動更新
- **ES6モジュール**: 完全対応（import/export）

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev
# → http://localhost:5173 で開発用サーバー起動
# → ソースマップ有効、デバッグ情報保持
# → ホットリロード機能

# プロダクション用ビルド
npm run build
# → dist/フォルダに本番用ファイル生成
# → HTMLファイルが dist/holder/, dist/verifier/ に自動配置
# → JS/CSSファイルが dist/assets/ に圧縮・バンドルされて配置
# → HTML内のパス参照が自動でアセットパスに更新
# → Tree-shaking、コード分割、圧縮最適化
# → ハッシュ付きファイル名で長期キャッシュ対応
# → GitHub Pages等への配布準備完了

# ビルド結果のプレビュー
npm run preview
# → http://localhost:4173 でビルド済みを配信
# → 本番環境での動作テスト
# → パフォーマンス確認、最終検証用
```

### 技術スタック詳細
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **UI フレームワーク**: Bootstrap 5 (CDN)
- **ビルドツール**: Vite
- **QRコード生成**: qrcode-generator v1.4.4
- **QRコード読み取り**: html5-qrcode v2.3.8
- **開発特徴**:
  - ES6 Modules使用可能
  - CORS問題なし（HTTPプロトコル）
  - リアルタイム開発体験

### 実装済み機能
- ✅ **QRコード機能**: qrcode-generator, html5-qrcodeライブラリ使用
- ✅ **リアカメラ自動起動**: 環境カメラ優先起動
- ✅ **ローディングUI**: 統一されたローディングアニメーション
- ✅ **VP提示フロー**: 選択的開示対応（本人確認/年齢認証）
- ✅ **VC発行申請フロー**: フォーム入力から発行までの完全フロー
- ✅ **レスポンシブデザイン**: Bootstrap 5ベースのモバイルファースト
- ✅ **ナビゲーション**: Holderアプリ用フッターナビ

### src/js/lib/配下のモジュール
```
src/js/lib/
├── showLoadingFor.js    # 共通ローディング機能 (default export)
├── cryptoUtils.js       # 暗号化・署名・検証ユーティリティ (named exports)
├── didRegistry.js       # DID管理・解決・登録機能 (named exports)
└── vcManager.js         # VC生成・管理・検証機能 (named exports)
```

### 開発時の注意点
1. **ES6モジュール**: `type="module"` スクリプトタグで読み込み
2. **import文**: `src/js/` 配下の相対パス指定（`../js/lib/showLoadingFor.js`）
3. **ホットリロード**: ファイル保存で自動更新
4. **ブラウザ対応**: モダンブラウザ必須（ES6対応）
5. **統一された構造**: 全ソースファイル（HTML/JS/CSS）が `src/` ディレクトリ配下に統一
6. **ビルド**: `npm run build` で `dist/` に最適化されたファイルが自動生成