/**
 * DIDレジストリ管理ユーティリティ
 *
 * 【ブロックチェーン移行時の変更箇所】
 * - LocalStorage → ブロックチェーン接続（Ethereum, Hyperledger等）
 * - 同期処理 → 非同期処理（await/async）
 * - ローカル管理 → 分散台帳管理
 */

import { generateKeyPair } from './cryptoUtils.js';

/**
 * DIDレジストリを初期化します。
 * 実稼働ではブロックチェーン接続（Ethereum、Hyperledger等）で分散台帳管理。
 * デモ版ではLocalStorageにIssuerの公開鍵を登録。
 *
 * @returns {Object} 初期化されたDIDレジストリ
 */
export const initializeDIDRegistry = () => {
  // 実稼働では以下の処理：
  // const web3 = new Web3(provider);
  // const contract = new web3.eth.Contract(DID_REGISTRY_ABI, CONTRACT_ADDRESS);
  // return await contract.methods.initialize().send({from: account});

  const didRegistry = localStorage.getItem('did_registry');
  if (!didRegistry) {
    // Issuerの鍵ペア生成（実稼働では実際の暗号鍵ペア生成）
    const issuerKeyPair = generateKeyPair();

    const registry = {
      "did:demo:issuer-001": {
        "publicKey": issuerKeyPair.publicKey,
        "createdAt": new Date().toISOString(),
        // 実稼働では以下も含む：
        // - verificationMethod: 検証方法の詳細
        // - authentication: 認証に使用可能な鍵
        // - keyAgreement: 鍵交換用の鍵
        // - service: サービスエンドポイント
      }
    };

    localStorage.setItem('did_registry', JSON.stringify(registry));
    console.log('DIDレジストリ初期化完了（実稼働では分散台帳に保存）');
    return registry;
  }

  return JSON.parse(didRegistry);
};

/**
 * DIDを分散台帳から解決してDIDドキュメントを取得します。
 * 実稼働では分散台帳やUniversal Resolverを使用。
 * デモ版ではLocalStorageから取得。
 *
 * @param {string} did - 解決するDID（例: "did:demo:issuer-001"）
 * @returns {Promise<Object|null>} W3C DIDドキュメント形式、見つからない場合はnull
 */
export const resolveDID = async (did) => {
  // 実稼働では以下の処理：
  // const response = await fetch(`https://uniresolver.io/1.0/identifiers/${did}`);
  // return await response.json();

  // または：
  // const web3 = new Web3(provider);
  // const contract = new web3.eth.Contract(DID_REGISTRY_ABI, CONTRACT_ADDRESS);
  // return await contract.methods.resolve(did).call();

  // デモ版：LocalStorageから取得
  try {
    const didRegistry = localStorage.getItem('did_registry');
    if (!didRegistry) {
      console.error(`DIDレジストリが見つかりません`);
      return null;
    }

    const registry = JSON.parse(didRegistry);
    const didDocument = registry[did];

    if (!didDocument) {
      console.error(`DID ${did} が見つかりません`);
      return null;
    }

    // W3C DID Document形式で返却
    return {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      "id": did,
      "verificationMethod": [{
        "id": `${did}#key-1`,
        "type": "Ed25519VerificationKey2020",
        "controller": did,
        "publicKeyBase58": didDocument.publicKey
      }],
      "authentication": [`${did}#key-1`],
      "assertionMethod": [`${did}#key-1`],
      "created": didDocument.createdAt
    };
  } catch (error) {
    console.error('DID解決エラー:', error);
    return null;
  }
};

/**
 * 指定されたDIDの公開鍵を取得します。
 * 実稼働では分散台帳からDIDドキュメントを解決して公開鍵を取得。
 * デモ版ではLocalStorageから直接取得。
 *
 * @param {string} did - 公開鍵を取得するDID
 * @returns {string|null} 公開鍵、見つからない場合はnull
 */
export const getPublicKey = (did) => {
  // 実稼働では以下の処理：
  // const didDocument = await resolveDID(did);
  // return didDocument.verificationMethod[0].publicKeyJwk;

  // デモ版：LocalStorageから直接取得
  try {
    const didRegistry = localStorage.getItem('did_registry');
    if (!didRegistry) {
      console.error('DIDレジストリが見つかりません（実稼働では分散台帳から取得）');
      return null;
    }

    const registry = JSON.parse(didRegistry);
    const didInfo = registry[did];

    if (!didInfo || !didInfo.publicKey) {
      console.error(`DID公開鍵が見つかりません: ${did}`);
      return null;
    }

    return didInfo.publicKey;
  } catch (error) {
    console.error('公開鍵取得エラー:', error);
    return null;
  }
};

/**
 * DIDを分散台帳に登録します。
 * 実稼働ではブロックチェーンのスマートコントラクト経由で登録。
 * デモ版ではLocalStorageに保存。
 *
 * @param {string} did - 登録するDID
 * @param {string} publicKey - 対応する公開鍵
 * @param {string|null} [privateKey=null] - 秘密鍵（実稼働では保存しない、ローカルのみ管理）
 * @returns {Promise<boolean>} 登録成功時はtrue、失敗時はfalse
 */
export const registerDID = async (did, publicKey, privateKey = null) => {
  // 実稼働では以下の処理：
  // const web3 = new Web3(provider);
  // const contract = new web3.eth.Contract(DID_REGISTRY_ABI, CONTRACT_ADDRESS);
  // return await contract.methods.register(did, publicKey).send({from: account});

  // デモ版：LocalStorageに保存
  try {
    let registry = {};
    const existingRegistry = localStorage.getItem('did_registry');
    if (existingRegistry) {
      registry = JSON.parse(existingRegistry);
    }

    registry[did] = {
      publicKey: publicKey,
      createdAt: new Date().toISOString(),
      // privateKeyは実稼働では保存しない（ローカルのみ管理）
      ...(privateKey && { privateKey })
    };

    localStorage.setItem('did_registry', JSON.stringify(registry));
    console.log(`DID登録完了: ${did}（実稼働では分散台帳に登録）`);
    return true;
  } catch (error) {
    console.error('DID登録エラー:', error);
    return false;
  }
};

/**
 * Holder用のDIDを生成します。
 * 実稼働では適切なDID Method（did:key、did:ethr、did:web、did:ion等）を使用。
 * デモ版では簡易DID生成。
 *
 * @returns {string} 生成されたDID
 * @example
 * const holderDID = generateHolderDID();
 * // "did:key:z6Mk..."形式のDIDを返す
 */
export const generateHolderDID = () => {
  // 実稼働では以下のDID Method使用：
  // - did:key: 公開鍵ベース
  // - did:ethr: Ethereum
  // - did:web: Web-based
  // - did:ion: ION (Bitcoin)

  // デモ版：簡易DID生成
  return `did:key:z6Mk${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * DIDレジストリを完全リセットします（開発用）。
 * 実稼働では使用禁止。
 * デモ版ではLocalStorageから削除。
 *
 * @returns {void}
 */
export const resetDIDRegistry = () => {
  localStorage.removeItem('did_registry');
  console.log('DIDレジストリをリセットしました');
};