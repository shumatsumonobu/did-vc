/**
 * 暗号化・署名・検証ユーティリティ
 *
 * 【ブロックチェーン移行時の変更箇所】
 * - 疑似実装 → 実際の暗号ライブラリ（Web Crypto API, jose等）
 * - 文字列チェック → EdDSA/ECDSA署名検証
 * - ランダム文字列 → 実際の暗号鍵ペア生成
 */

/**
 * 暗号鍵ペアを生成します。
 * 実稼働ではEd25519やsecp256k1等の実際の暗号鍵を生成。
 * デモ版では疑似鍵ペア生成。
 *
 * @returns {Object} 生成された鍵ペア
 * @returns {string} returns.publicKey - 公開鍵
 * @returns {string} returns.privateKey - 秘密鍵
 */
export const generateKeyPair = () => {
  // 実稼働では以下の処理：
  // const keyPair = await crypto.subtle.generateKey(
  //   { name: "EdDSA", namedCurve: "Ed25519" },
  //   true,
  //   ["sign", "verify"]
  // );

  return {
    publicKey: `mock_public_key_${Math.random().toString(36).substring(2, 15)}`,
    privateKey: `mock_private_key_${Math.random().toString(36).substring(2, 15)}`
  };
};

/**
 * データのデジタル署名を生成します。
 * 実稼働ではJSON-LD正規化、ハッシュ化、EdDSA/ECDSA署名をJWS形式で生成。
 * デモ版では疑似署名を生成。
 *
 * @param {Object} data - 署名対象のデータ
 * @param {string} [privateKey] - 署名に使用する秘密鍵（デモ版では未使用）
 * @returns {string} JWS形式の署名
 */
export const generateSignature = (data, privateKey) => {
  // 実稼働では以下の処理：
  // 1. データを正規化（JSON-LD Canonicalization）
  // 2. ハッシュ化（SHA-256等）
  // 3. 秘密鍵で署名生成
  // 4. JWS形式でエンコード

  // const encoder = new TextEncoder();
  // const dataBuffer = encoder.encode(JSON.stringify(data));
  // const signature = await crypto.subtle.sign("EdDSA", privateKey, dataBuffer);
  // return base64url.encode(signature);

  // デモ版：疑似署名（Unicode対応）
  const dataString = JSON.stringify(data);
  const encodedData = btoa(unescape(encodeURIComponent(dataString))).replace(/=/g, '');
  const mockSignature = `eyJhbGci.${encodedData}.mock_signature_${Math.random().toString(36).substring(2, 15)}`;
  return mockSignature;
};

/**
 * デジタル署名を検証します。
 * 実稼働ではJSON-LD正規化、ハッシュ化、EdDSA/ECDSA署名検証を実行。
 * デモ版では疑似署名検証を実行。
 *
 * @param {string} signature - 検証する署名
 * @param {Object} data - 署名対象のデータ
 * @param {string} publicKey - 検証に使用する公開鍵
 * @returns {boolean} 署名が有効な場合はtrue、無効な場合はfalse
 */
export const verifySignature = (signature, data, publicKey) => {
  // 実稼働では以下の処理：
  // 1. VCデータの正規化（JSON-LD Canonicalization）
  // 2. ハッシュ化（SHA-256等）
  // 3. 公開鍵による署名検証（EdDSA, ECDSA等）

  // const encoder = new TextEncoder();
  // const dataBuffer = encoder.encode(JSON.stringify(data));
  // const signatureBuffer = base64url.decode(signature);
  // return await crypto.subtle.verify("EdDSA", publicKey, signatureBuffer, dataBuffer);

  // デモ版：簡易的な検証（実際のプロダクションでは使用不可）
  if (!signature || !signature.includes('mock_signature')) {
    return false;
  }

  // 公開鍵の存在確認（実稼働では実際の鍵形式チェック）
  return publicKey && publicKey.startsWith('mock_public_key');
};

/**
 * JWS形式の署名を検証します。
 * 実稼働では標準JWSライブラリ（jose等）を使用した完全な検証。
 * デモ版ではJWS形式の疑似検証を実行。
 *
 * @param {string} jws - 検証するJWS形式の署名
 * @param {string} publicKey - 検証に使用する公開鍵
 * @returns {boolean} 署名が有効な場合はtrue、無効な場合はfalse
 */
export const verifyJWSSignature = (jws, publicKey) => {
  // 実稼働では以下の処理：
  // import { jwtVerify } from 'jose';
  // try {
  //   await jwtVerify(jws, publicKey);
  //   return true;
  // } catch {
  //   return false;
  // }

  // デモ版：JWS形式の疑似検証
  if (!jws || typeof jws !== 'string') {
    return false;
  }

  // JWS形式チェック（header.payload.signature）
  const parts = jws.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // 疑似署名パターンチェック
  return parts[2].includes('mock_signature') &&
         publicKey &&
         publicKey.startsWith('mock_public_key');
};

/**
 * データをハッシュ化します。
 * 実稼働ではSHA-256等の暗号学的ハッシュ関数を使用。
 * デモ版では疑似ハッシュを生成。
 *
 * @param {Object} data - ハッシュ化するデータ
 * @returns {string} ハッシュ値
 */
export const hashData = (data) => {
  // 実稼働では以下の処理：
  // const encoder = new TextEncoder();
  // const dataBuffer = encoder.encode(JSON.stringify(data));
  // const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  // return Array.from(new Uint8Array(hashBuffer))
  //   .map(b => b.toString(16).padStart(2, '0'))
  //   .join('');

  // デモ版：疑似ハッシュ（Unicode対応）
  const dataString = JSON.stringify(data);
  const encodedData = btoa(unescape(encodeURIComponent(dataString)));
  return `mock_hash_${encodedData.substring(0, 16)}`;
};