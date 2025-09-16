# DID/VC Basic Demo

Verifiable Credentials（VC）の発行・保有・検証を体験できるシンプルなデモシステム

## 概要

3つの役割（Holder、Issuer、Verifier）を通じて、デジタル証明書の基本的な流れを理解できるデモ。選択的開示により、必要な情報のみを提示できる。

## システム構成

```
did-vc-basic-demo/
├── index.html       # トップページ（役割選択）
├── holder.html      # 保有者画面
├── issuer.html      # 発行者画面
├── verifier.html    # 検証者画面
├── style.css        # 共通スタイル
├── lib/             # モジュール群（機能別）
└── README.md        # 本ドキュメント
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
- 本番: ブロックチェーンや分散レジストリで公開鍵を管理（分散・永続的）
- デモ: LocalStorageで公開鍵を管理（ローカル・一時的）

この簡易実装により、外部依存なくデモが動作可能。

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
1. 全ファイルを同一ディレクトリに配置
2. Webサーバーで配信（GitHub Pages推奨）
3. 複数デバイスで同じURLにアクセス

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

## 必要環境

- モダンブラウザ（Chrome/Firefox/Safari/Edge）
- JavaScript有効
- LocalStorage有効