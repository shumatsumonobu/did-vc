/**
 * Verifiable Credentials管理ユーティリティ
 *
 * 【ブロックチェーン移行時の変更箇所】
 * - LocalStorage → 分散ストレージ（IPFS等）またはプライベートウォレット
 * - 疑似署名 → 実際の暗号署名
 * - 簡易検証 → 完全なVC検証ライブラリ使用
 */

import { generateSignature, verifySignature, verifyJWSSignature } from './cryptoUtils.js';
import { generateHolderDID, getPublicKey } from './didRegistry.js';

/**
 * W3C標準準拠のVerifiable Credential (VC)を生成します。
 * 実稼働環境では@digitalbazaar/vcライブラリを使用してEdDSA署名を適用。
 * デモ版では疑似署名を生成。
 *
 * @param {Object} data - VC生成に使用する個人データ
 * @param {string} data.name - 氏名
 * @param {string} data.birth - 生年月日（YYYY-MM-DD形式）
 * @param {string} data.address - 住所
 * @param {string} data.gender - 性別
 * @returns {Object} 生成されたVC（JSON-LD形式、デジタル署名付き）
 * @example
 * const vc = createVerifiableCredential({
 *   name: "山田太郎",
 *   birth: "1990-05-15",
 *   address: "東京都千代田区霞が関1-1-1",
 *   gender: "男性"
 * });
 */
export const createVerifiableCredential = (data) => {
  // 実稼働では以下のライブラリ使用：
  // import { issue } from '@digitalbazaar/vc';
  // return await issue({
  //   credential: vcData,
  //   suite: new Ed25519Signature2020({...}),
  //   documentLoader: customDocumentLoader
  // });

  const now = new Date().toISOString();
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1年後

  // Holder DID生成（実稼働では既存DIDまたは新規生成）
  const holderDID = generateHolderDID();

  const vcData = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "IdentityCredential"],
    "issuer": "did:demo:issuer-001",
    "issuanceDate": now,
    "expirationDate": expirationDate.toISOString(),
    "credentialSubject": {
      "id": holderDID,
      "name": data.name,
      "birthDate": data.birth,
      "address": data.address,
      "gender": data.gender
    }
  };

  // 署名生成（実稼働では実際の暗号署名）
  const signature = generateSignature(vcData);

  return {
    ...vcData,
    "proof": {
      "type": "MockSignature2024",
      "created": now,
      "verificationMethod": "did:demo:issuer-001#key-1",
      "jws": signature // 疑似署名（実稼働では実際の暗号署名）
    }
  };
};

/**
 * VCをローカルウォレットに保存します。
 * 実稼働ではプライベートウォレットアプリや暗号化IPFS、プライベートクラウドに保存。
 * デモ版ではLocalStorageに保存。
 *
 * @param {Object} vc - 保存するVerifiable Credential
 * @returns {boolean} 保存成功時はtrue、失敗時はfalse
 */
export const saveVCToWallet = (vc) => {
  // 実稼働では以下の方法：
  // - プライベートウォレットアプリに保存
  // - 暗号化してIPFSに保存
  // - ユーザーのプライベートクラウドに保存

  try {
    localStorage.setItem('vc_wallet', JSON.stringify(vc));
    console.log('VC保存完了（実稼働ではプライベートウォレットに保存）');
    return true;
  } catch (error) {
    console.error('VC保存エラー:', error);
    return false;
  }
};

/**
 * ローカルウォレットからVCを取得します。
 * 実稼働ではウォレットアプリや暗号化されたIPFS、プライベートストレージから取得。
 * デモ版ではLocalStorageから取得。
 *
 * @returns {Object|null} 保存されているVC、存在しない場合はnull
 */
export const getVCFromWallet = () => {
  // 実稼働では以下の処理：
  // - ウォレットアプリからVC取得
  // - 暗号化されたIPFSから復号して取得
  // - ユーザー認証後にプライベートストレージから取得

  try {
    const vcData = localStorage.getItem('vc_wallet');
    if (!vcData) {
      return null;
    }

    const vc = JSON.parse(vcData);

    // VC構造の基本検証
    if (!vc.credentialSubject || !vc.proof) {
      console.error('無効なVC構造');
      return null;
    }

    return vc;
  } catch (error) {
    console.error('VC取得エラー:', error);
    return null;
  }
};

/**
 * ローカルウォレットにVCが存在するかチェックします。
 *
 * @returns {boolean} VCが存在する場合はtrue、存在しない場合はfalse
 */
export const checkVCExists = () => {
  const vc = getVCFromWallet();
  return vc !== null;
};

/**
 * ローカルウォレットからVCを削除します（ウォレットリセット）。
 * 実稼働では安全な削除、バックアップ確認、削除ログ記録を実行。
 * デモ版ではLocalStorageから削除。
 *
 * @returns {boolean} 削除成功時はtrue、失敗時はfalse
 */
export const removeVCFromWallet = () => {
  // 実稼働では以下の処理：
  // - ウォレットから安全に削除
  // - バックアップの確認
  // - 削除ログの記録

  try {
    localStorage.removeItem('vc_wallet');
    console.log('VC削除完了');
    return true;
  } catch (error) {
    console.error('VC削除エラー:', error);
    return false;
  }
};

/**
 * VP（Verifiable Presentation）の検証を行います。
 * 実稼働では@digitalbazaar/vcライブラリを使用した完全な署名検証。
 * デモ版では基本構造チェックと疑似署名検証。
 *
 * @param {string} vpData - 検証するVPデータ（JSON文字列）
 * @returns {boolean} 検証成功時はtrue、失敗時はfalse
 */
export const validateVP = (vpData) => {
  // 実稼働では以下のライブラリ使用：
  // import { verify } from '@digitalbazaar/vc';
  // return await verify({
  //   presentation: vpData,
  //   suite: new Ed25519Signature2020({...}),
  //   documentLoader: customDocumentLoader
  // });

  try {
    // Base64デコードしてからJSONパース（QRコード文字化け対策）
    const decodedData = decodeURIComponent(escape(atob(vpData)));
    const data = JSON.parse(decodedData);

    // 基本構造チェック
    if (!data || !data.t || !data.iss) {
      console.error('VP構造エラー: 必要フィールドが不足');
      return false;
    }

    // QRコード用軽量VPの簡易検証
    if (data.sig) {
      // 署名ハッシュの存在確認（実稼働では完全な署名検証）
      console.log('VP署名検証成功（QRコード用軽量署名）');
      return true;
    }

    // 完全なVPの場合は従来の検証
    return verifyVCSignature(data);
  } catch (error) {
    console.error('VP検証エラー:', error);
    return false;
  }
};

/**
 * VC署名検証を行います。
 * 実稼働ではDID解決、公開鍵取得、実際の暗号署名検証を実行。
 * デモ版では疑似署名検証を実行。
 *
 * @param {Object} vcData - 検証するVCデータ
 * @returns {boolean} 署名検証成功時はtrue、失敗時はfalse
 */
export const verifyVCSignature = (vcData) => {
  // 実稼働では以下の処理：
  // 1. DID解決：ブロックチェーンや分散台帳からIssuerのDIDドキュメント取得
  // 2. 公開鍵取得：DIDドキュメントから検証用公開鍵を抽出
  // 3. 署名検証：実際の暗号署名を検証

  try {
    const issuerDID = vcData.iss || 'did:demo:issuer-001';
    const publicKey = getPublicKey(issuerDID);

    if (!publicKey) {
      console.error(`Issuer公開鍵が見つかりません: ${issuerDID}`);
      return false;
    }

    // 疑似署名検証（実稼働では実際の署名アルゴリズム）
    const signature = vcData.jws || (vcData.proof && vcData.proof.jws);
    const isValidSignature = verifyJWSSignature(signature, publicKey);

    if (isValidSignature) {
      console.log('VC署名検証成功（実稼働では実際の暗号署名で検証）');
      return true;
    } else {
      console.error('VC署名検証失敗');
      return false;
    }
  } catch (error) {
    console.error('署名検証エラー:', error);
    return false;
  }
};

/**
 * 選択的開示VP（Verifiable Presentation）を生成します。
 * 実稼働ではZero-Knowledge Proofs (ZKP)、BBS+ Signatures、Selective Disclosure JWTを使用。
 * デモ版では必要な属性のみを抽出してQRコード用に最適化。
 *
 * @param {string} scenario - 開示シナリオ（'identity'または'age'）
 * @returns {string|null} 生成されたVPデータ（JSON文字列）、失敗時はnull
 * @example
 * const vp = createSelectiveDisclosureVP('identity');
 * // 本人確認用：氏名、生年月日、住所を含むVP
 */
export const createSelectiveDisclosureVP = (scenario) => {
  // 実稼働では以下の技術使用：
  // - Zero-Knowledge Proofs (ZKP)
  // - BBS+ Signatures
  // - Selective Disclosure JWT

  const vc = getVCFromWallet();
  if (!vc) {
    console.error('VCが見つかりません');
    return null;
  }

  let disclosedData;

  if (scenario === 'identity') {
    // 本人確認：氏名・生年月日・住所を開示
    disclosedData = {
      t: 'identity',
      iss: 'did:demo:issuer-001', // 短縮化
      name: vc.credentialSubject.name,
      birth: vc.credentialSubject.birthDate, // キー名短縮
      addr: vc.credentialSubject.address,    // キー名短縮
      ts: Math.floor(Date.now() / 1000)      // タイムスタンプ追加
    };
  } else if (scenario === 'age') {
    // 年齢認証：生年月日のみ開示
    disclosedData = {
      t: 'age',
      iss: 'did:demo:issuer-001', // 短縮化
      birth: vc.credentialSubject.birthDate, // キー名短縮
      ts: Math.floor(Date.now() / 1000)      // タイムスタンプ追加
    };
  } else {
    console.error('未対応のシナリオ:', scenario);
    return null;
  }

  // QRコード用には軽量な署名ハッシュのみ含める（実稼働では短縮署名）
  if (vc.proof && vc.proof.jws) {
    // 署名の最初の16文字のみ（QRコードサイズ制限対応）
    disclosedData.sig = vc.proof.jws.substring(0, 16);
  }

  // 日本語文字化け対策：UTF-8テキストをBase64エンコーディング
  const jsonString = JSON.stringify(disclosedData);
  return btoa(unescape(encodeURIComponent(jsonString)));
};