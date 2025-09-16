# DID/VC Basic Demo 実装指示

## このディレクトリの目的
DID/VCの基本的な動作を理解するためのシンプルなデモ実装

## ファイル構成
```
examples/basic/
├── index.html       # 役割選択画面
├── holder.html      # 保有者画面
├── issuer.html      # 発行者画面
├── verifier.html    # 検証者画面
├── style.css        # 共通スタイル
├── lib/             # モジュール群（機能別に分割）
└── README.md        # デモ説明
```

## モジュール設計方針
- **lib/ディレクトリ** に機能別モジュールを配置
- **ES6モジュール** として実装（import/export使用）
- 実装時に必要に応じてモジュールを追加・調整

## UI/UXデザイン規則
- **フレームワーク**: Bootstrap 5 CDN使用
- **フォントサイズ**: 小さめ（0.8125rem）
  ```css
  :root {
    --bs-body-font-size: 0.8125rem;
  }
  ```
- **配色**: プロ感のある最小限のカラーリング
  - Primary: #2c3e50（濃紺）
  - Secondary: #6c757d（グレー）
  - Background: #f8f9fa（薄グレー）
  - Text: #333333
- **デザイン**: シンプルで落ち着いた配色

## 技術仕様
### DID管理
- **Holder**: 初回起動時に自己生成（did:key:z6Mk...）
- **Issuer**: 固定値（did:demo:issuer-001）
- **Verifier**: DID不要

### データ管理
- **公開鍵**: LocalStorageの`did_registry`に保存
- **VC保存**: LocalStorageの`vc_wallet`
- **署名**: 疑似実装（デモ用）

### 動作フロー
1. **VC発行**: Holderがフォーム入力 → 内部でIssuer処理 → 即座にVC発行
2. **VP提示**: 身分証明/年齢確認を選択 → 必要項目のみ抽出 → QRコード生成
3. **検証**: QRスキャン（テキスト入力） → 署名検証 → 結果表示

## Holder画面仕様
- **トップページ**: 大きな2つのメニューボタン
  - VC管理ボタン → VC管理画面へ
  - VP提示ボタン → VP提示画面へ
- **VC管理画面**:
  - 申請フォーム（氏名、生年月日、住所）
  - ウォレット（保有VC一覧）
- **VP提示画面**:
  - 身分証明VP（氏名・住所）
  - 年齢確認VP（生年月日のみ）

## 重要な実装原則
1. **HolderのDIDは自己生成** - Issuerは関与しない
2. **選択的開示は2種類のみ** - 身分証明と年齢確認
3. **検証にはIssuerの公開鍵のみ必要** - Holderの公開鍵は不要
4. **LocalStorageで完結** - 外部API不要
5. **QRコードは直接埋め込み** - 最大2-3KB

## 必要な機能（実装時に適切にモジュール化）
- DID生成・管理機能
- 鍵ペア生成（疑似実装）
- VC作成・解析
- VP作成・解析（選択的開示）
- DIDレジストリ（LocalStorage）
- 署名・検証（疑似実装）
- ユーティリティ（UUID生成、Base64エンコード等）

## HTMLでのモジュール使用例
```html
<script type="module">
  // 必要な機能をインポート
  import { generateDID } from './lib/did.js';
  import { createVC } from './lib/vc.js';
  // ...
</script>
```

## エラー処理
- 必須フィールドの検証
- QRコードサイズ制限のチェック
- LocalStorage使用可能性の確認
- 適切なエラーメッセージ表示