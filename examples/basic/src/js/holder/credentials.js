import showLoadingFor from '../lib/showLoadingFor.js';
import { initializeDIDRegistry } from '../lib/didRegistry.js';
import { createVerifiableCredential, saveVCToWallet, getVCFromWallet, removeVCFromWallet } from '../lib/vcManager.js';

/**
 * VC発行申請を処理します。
 * フォームバリデーション、DIDレジストリ初期化、VC生成、ウォレット保存を実行。
 *
 * @param {Event} event - フォームsubmitイベント
 * @returns {Promise<void>}
 */
const submitApplication = async (event) => {
  // フォームのデフォルト送信を防止
  event.preventDefault();

  const form = event.target;

  // バリデーション実行
  if (!form.checkValidity()) {
    // バリデーション失敗時はBootstrapのvalidationクラスを適用
    form.classList.add('was-validated');
    return;
  }

  // DIDレジストリ初期化（Issuerの公開鍵登録）
  initializeDIDRegistry();

  // フォームデータを取得
  const name = document.getElementById('fullName').value.trim();
  const birth = document.getElementById('birthDate').value;
  const address = document.getElementById('address').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked').nextElementSibling.textContent;

  // VC発行処理をシミュレート
  await showLoadingFor();

  // W3C標準準拠のVC (JSON-LD形式) を生成
  const vc = createVerifiableCredential({name, birth, address, gender});

  // VC内容を設定
  document.getElementById('vc-name').textContent = name;
  document.getElementById('vc-birth').textContent = new Date(birth).toLocaleDateString('ja-JP');
  document.getElementById('vc-address').textContent = address;
  document.getElementById('vc-gender').textContent = gender;

  // 画面を切り替え
  document.getElementById('application-form').style.display = 'none';
  document.getElementById('credentials-list').style.display = 'block';

  // VCをウォレットに保存
  const saved = saveVCToWallet(vc);

  if (!saved) {
    alert('VC保存に失敗しました。再度お試しください。');
  }
}

/**
 * VC申請をリセットします。
 * 画面表示を申請フォームに切り替え、ウォレットからVCを削除。
 *
 * @returns {void}
 */
const resetApplication = () => {
  // 画面を切り替え
  document.getElementById('credentials-list').style.display = 'none';
  document.getElementById('application-form').style.display = 'block';

  // ウォレットからVCを削除
  removeVCFromWallet();
}

/**
 * リアルタイムバリデーション機能を設定します。
 * 入力時にバリデーション状態をクリア・更新し、視覚的フィードバックを提供。
 *
 * @returns {void}
 */
const setupRealtimeValidation = () => {
  const requiredFields = ['fullName', 'birthDate', 'address'];

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);

    // 入力時にバリデーション状態をクリア
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
        if (field.closest('form').classList.contains('was-validated')) {
          field.classList.add('is-invalid');
        }
      }
    });
  });
};

// イベントリスナーを設定
document.getElementById('vc-application-form').addEventListener('submit', submitApplication);
document.getElementById('reset-btn').addEventListener('click', resetApplication);

// リアルタイムバリデーション初期化
setupRealtimeValidation();

// ページ読み込み時に状態を復元
window.addEventListener('DOMContentLoaded', () => {
  const vc = getVCFromWallet();
  if (vc && vc.credentialSubject) {
    // VC内容を復元
    document.getElementById('vc-name').textContent = vc.credentialSubject.name;
    document.getElementById('vc-birth').textContent = new Date(vc.credentialSubject.birthDate).toLocaleDateString('ja-JP');
    document.getElementById('vc-address').textContent = vc.credentialSubject.address;
    document.getElementById('vc-gender').textContent = vc.credentialSubject.gender;

    document.getElementById('application-form').style.display = 'none';
    document.getElementById('credentials-list').style.display = 'block';
  }
});