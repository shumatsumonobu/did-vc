# DID/VC Basic Demo

Verifiable Credentials（VC）の発行・保有・検証を体験できるシンプルなデモシステム

## 概要

3つの役割（Holder、Issuer、Verifier）を通じて、デジタル証明書の基本的な流れを理解できるデモ。選択的開示により、必要な情報のみを提示できる。

## システム構成

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
└── README.md              # 本ドキュメント
```

## 動作フロー

### 1. VC発行フェーズ
Holderがフォーム入力、内部でIssuer処理、即座にVC発行

**詳細処理:**
1. Holder側の処理：
   - 初回起動時に自分のDIDを生成（did:key:z6Mk...）
   - 個人情報入力（氏名、生年月日、住所）
   - 申請データにHolderのDIDを含めて送信
2. Issuer側の処理（内部自動実行）：
   - HolderのDIDを受け取る
   - IssuerのDID（did:demo:issuer-001）を発行者として記載
   - credentialSubjectにHolder情報を格納
   - Issuerの秘密鍵で署名生成（疑似実装）
   - 有効期限を設定（発行日から1年）
3. 署名済みVCをHolderのウォレット（LocalStorage）に保存

**生成されるVC:**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "IdentityCredential"],
  "issuer": "did:demo:issuer-001",  // Issuerの固定DID
  "issuanceDate": "2024-01-15T10:00:00Z",
  "expirationDate": "2025-01-15T10:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6Mk...",  // Holderが生成した自分のDID
    "name": "田中太郎",
    "birthDate": "2000-01-15",
    "address": "東京都渋谷区..."
  },
  "proof": {
    "type": "MockSignature2024",
    "jws": "eyJhbGci..."  // Issuerの署名（疑似）
  }
}
```

### 2. VP提示フェーズ
HolderがVP種類選択、必要項目のみ抽出、QRコード生成

### 3. 検証フェーズ
VerifierがQRスキャン、データ取得、署名検証

### QRコードに含まれるデータ詳細

#### 身分証明の場合（約1.5KB）
```json
{
  "type": "VerifiablePresentation",
  "verifiableCredential": [{
    "issuer": "did:demo:issuer-001",  // Issuerの識別子
    "credentialSubject": {
      "id": "did:key:z6Mk...",        // Holderの識別子
      "name": "田中太郎",             // 開示項目
      "address": "東京都渋谷区..."     // 開示項目
    },
    "proof": {
      "jws": "eyJhbGci..."            // Issuerの署名
    }
  }],
  "holder": "did:key:z6Mk..."         // VP作成者
}
```

#### 年齢確認の場合（約1.3KB）
```json
{
  "type": "VerifiablePresentation",
  "verifiableCredential": [{
    "issuer": "did:demo:issuer-001",
    "credentialSubject": {
      "id": "did:key:z6Mk...",
      "birthDate": "2000-01-15"       // 開示項目（年齢計算用）
    },
    "proof": {
      "jws": "eyJhbGci..."
    }
  }],
  "holder": "did:key:z6Mk..."
}
```

選択的開示により、用途に応じて必要最小限の情報のみQRコードに含まれる。

## 各画面の機能

### Holder（保有者）
- **トップページ**
  - VC管理ボタン（大きなメニュー）
  - VP提示ボタン（大きなメニュー）
- **VC管理画面**
  - 申請フォーム（氏名、生年月日、住所）
  - ウォレット（保有VC一覧）
- **VP提示画面**
  - 身分証明VP（氏名・住所）
  - 年齢確認VP（生年月日のみ）

### Issuer（発行者）
- 発行機関情報表示
- 発行履歴
- 自動発行モード（本人確認省略）

### Verifier（検証者）
- 身分証明検証
- 年齢確認検証（20歳以上）
- 検証結果表示

## 技術仕様

- **DID**: 
  - Holder: 自動生成（did:key）
  - Issuer: 固定（did:demo:issuer-001）
  - Verifier: なし
- **データ保存**: LocalStorage
- **QRコード**: VPデータを直接埋め込み
- **署名**: 疑似実装（デモ用）
- **公開鍵管理**: LocalStorage（デモ用）

### 公開鍵の管理（デモ版）

**LocalStorageでの簡易実装:**
```
did_registry: {
  "did:demo:issuer-001": {
    "publicKey": "mock_public_key_xyz...",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

- **Issuer起動時**: 鍵ペアを生成し、公開鍵をLocalStorageの`did_registry`に登録
- **検証時**: LocalStorageから公開鍵を取得して署名検証（疑似実装）
- **制限事項**: 同一ブラウザ内でのみ動作、分散性なし

**本番環境との違い:**

| 項目 | 本番環境 | このデモ | 理由・学習ポイント |
|------|----------|----------|-------------------|
| **DID解決** | ブロックチェーン/分散台帳から取得 | LocalStorageから取得 | 分散性の概念を理解 |
| **公開鍵管理** | 分散レジストリで永続的に管理 | LocalStorage（一時的） | 信頼チェーンの重要性を学習 |
| **署名アルゴリズム** | EdDSA, ECDSA等の実際の暗号 | 疑似署名（文字列チェック） | 暗号署名の必要性を理解 |
| **鍵ペア生成** | 実際の暗号鍵ペア（Ed25519等） | ランダム文字列 | 鍵管理の重要性を学習 |
| **データ正規化** | JSON-LD Canonicalization | 簡易JSON変換 | データ整合性の重要性 |
| **署名検証** | `crypto.subtle.verify()`等 | 文字列パターンマッチ | 暗号学的証明の概念 |

この簡易実装により、外部依存なしでVC/VPの本質的な流れを学習可能。

### 鍵ペアと検証の仕組み

**2組の鍵ペアの役割:**
- **Issuerの鍵ペア**: VCに署名するため。公開鍵はLocalStorageに登録
- **Holderの鍵ペア**: VP作成時の署名用（本デモでは省略）

**VC検証で必要なもの:**
- Issuerの公開鍵のみ（VCが本物かの確認）
- Holderの公開鍵は不要（本デモでは本人確認を省略）

**本人確認の3つのレベル:**
1. **不要**: 無記名チケットのような使い方
2. **簡易確認**: HolderのDIDを確認するのみ（本デモ採用）
3. **厳密確認**: Holderの署名も検証（銀行等で必要）

本デモでは実装の簡略化のため、レベル2（簡易確認）を採用。コンビニでの年齢確認など、多くの実用場面ではこれで十分。

## デモ実行方法

### 準備
1. プロジェクトを適切な場所にクローンまたはダウンロード
2. 開発時: `npm run dev` でローカル開発サーバーを起動
3. 本番時: `npm run build` → `dist/` フォルダをWebサーバーで配信（GitHub Pages推奨）
4. 複数デバイスで同じURLにアクセス

### 実行手順
1. **スマホ**: Holder画面でVC申請・発行
2. **スマホ**: VP種類選択してQRコード生成
3. **PC**: Verifier画面でQRコードスキャン
4. **PC**: 検証結果確認

### データ交換方式
- QRコードにVPデータを直接埋め込み
- デバイス間の直接通信は不要
- 最大データサイズ約2-3KB

## 注意事項

- デモ用の簡略実装（本人確認なし）
- 同一ブラウザ内でのみ動作
- 署名検証は疑似実装

## 開発環境セットアップ

### 必要環境
- Node.js (v18以上推奨)
- モダンブラウザ（Chrome/Firefox/Safari/Edge）
- JavaScript有効
- LocalStorage有効

### 起動方法

```bash
# 1. 依存関係をインストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザでアクセス
# http://localhost:5173 または http://localhost:5174
# （ポートが使用中の場合は自動で次のポートが使用されます）
```

### 利用可能なコマンド

```bash
# 開発サーバー起動（ホットリロード付き）
npm run dev
# → http://localhost:5173 で開発サーバー起動
# → ファイル変更時に自動リロード

# プロダクション用ビルド
npm run build
# → dist/フォルダに最適化されたファイルを生成
# → HTML/CSS/JSを圧縮・バンドル
# → 本番環境にデプロイ可能な状態

# ビルド結果のプレビュー
npm run preview
# → http://localhost:4173 でビルド済みファイルを配信
# → 本番環境と同じ状態での動作確認
# → npm run build 実行後に使用
```

### 技術スタック
- **ビルドツール**: Vite v6.3.6
- **モジュールシステム**: ES6 Modules (import/export)
- **開発サーバー**: http://localhost:5173
- **ライブラリ**:
  - QRコード生成: qrcode-generator v1.4.4
  - QRコード読み取り: html5-qrcode v2.3.8
  - UI: Bootstrap 5

### 開発の特徴
- **ホットリロード**: ファイル変更で自動更新
- **ES6モジュール**: import/export完全対応
- **CORS問題解決**: HTTPプロトコルで動作
- **高速起動**: Viteによる高速ビルド

### 各コマンドの詳細

#### `npm run dev` (開発モード)
- **目的**: 開発中のリアルタイム編集
- **最適化**: なし（デバッグ重視）
- **特徴**: ソースマップ、詳細エラー、高速リロード

#### `npm run build` (ビルド)
- **出力先**: `dist/` フォルダ
- **最適化**: ファイル圧縮、Tree-shaking、コード分割
- **用途**: 本番デプロイ、GitHub Pages公開
- **自動処理**:
  - HTMLファイルが `dist/holder/`, `dist/verifier/` に配置
  - CSS・JSファイルパスが最適化されたアセットパスに自動更新
  - ハッシュ付きファイル名で長期キャッシュに対応
- **生成ファイル**:
  - `dist/holder/*.html`, `dist/verifier/*.html` (最適化済みHTML)
  - `dist/assets/js/*-[hash].js` (バンドル済み・圧縮JS)
  - `dist/assets/css/main-[hash].css` (圧縮CSS)

#### `npm run preview` (プレビュー)
- **前提**: `npm run build` 実行済み
- **目的**: 本番環境での最終確認
- **ポート**: http://localhost:4173
- **確認項目**: パフォーマンス、読み込み速度、機能動作

## 開発フロー

### ファイル編集の流れ

1. **全ソースファイルの編集**:
   - **HTML**: `src/index.html`, `src/holder/*.html`, `src/verifier/*.html` を編集
   - **JavaScript**: `src/js/` 配下のファイルを編集
   - **CSS**: `src/css/style.css` を編集
   - 全ての変更がリアルタイムで反映

3. **本番ビルド**:
   ```bash
   npm run build
   ```
   - HTMLファイルが `dist/` に自動配置・最適化
   - JavaScript・CSSが圧縮・バンドルされて `dist/assets/` に配置
   - HTMLファイル内のパス参照が自動でアセットパスに更新

4. **本番デプロイ**:
   - `dist/` フォルダの内容をWebサーバーにアップロード
   - 高速化・最適化されたサイトが配信される

### 開発時の注意点
- **統一された構造**: 全ソースファイルが `src/` 配下に統一
- **直感的**: HTML・JavaScript・CSSが明確に分離
- **ビルド自動化**: ビルド時に自動で適切なパスに変換・最適化