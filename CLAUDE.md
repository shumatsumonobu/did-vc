# DID/VC 学習・実装プロジェクト

## プロジェクト概要
W3C標準準拠のDID（Decentralized Identifiers）とVC（Verifiable Credentials）の学習と実装を行うプロジェクト。

## プロジェクト構造
```
/
├── README.md           # 学習ガイド（概念説明）
└── examples/
    └── basic/         # 基本デモ実装
```

## 技術方針
- W3C標準準拠
- ブラウザのみで動作（サーバーレス）
- 教育目的のため、実装はシンプルに

## 用語定義
- **DID**: 分散型識別子
- **VC**: 検証可能な証明書
- **VP**: 検証可能な提示
- **Holder**: 証明書保有者
- **Issuer**: 証明書発行者
- **Verifier**: 証明書検証者

## コーディング規約
- ES6+を使用
- async/awaitを優先
- エラーハンドリングを適切に実装
- コメントは日本語可