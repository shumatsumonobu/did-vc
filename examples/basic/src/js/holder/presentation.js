import qrcode from 'qrcode-generator';
import showLoadingFor from '../lib/showLoadingFor.js';
import { checkVCExists, getVCFromWallet, createSelectiveDisclosureVP } from '../lib/vcManager.js';

let selectedScenario = null;

// イベントリスナーを設定
document.getElementById('identity-btn').addEventListener('click', () => selectScene('identity'));
document.getElementById('age-btn').addEventListener('click', () => selectScene('age'));

// ページ読み込み時にVC発行状態をチェック
window.addEventListener('load', () => {
  // QRCodeライブラリの読み込み確認
  if (typeof qrcode === 'undefined') {
    console.error('QRCodeライブラリが読み込まれていません');
  } else {
    console.log('QRCodeライブラリが正常に読み込まれました');
  }

  // VC発行状態を確認
  checkVCStatus();
});

/**
 * VCの発行状態をチェックして画面表示を切り替えます。
 * VCが存在する場合はVP提示エリアを表示、存在しない場合は誘導メッセージを表示。
 *
 * @returns {void}
 */
const checkVCStatus = () => {
  const hasVC = checkVCExists();

  if (hasVC) {
    // VCが発行済みの場合：VP提示エリアを表示
    document.getElementById('no-vc-message').style.display = 'none';
    document.getElementById('vp-presentation-area').style.display = 'block';
  } else {
    // VCが未発行の場合：誘導メッセージを表示
    document.getElementById('no-vc-message').style.display = 'block';
    document.getElementById('vp-presentation-area').style.display = 'none';
  }
}

/**
 * VP提示シナリオを選択してQRコード生成を開始します。
 *
 * @param {string} scene - 選択されたシナリオ（'identity'または'age'）
 * @returns {void}
 */
const selectScene = (scene) => {
  selectedScenario = scene;

  // QRコード生成をシミュレート
  generateQRCode(scene);

  // ボタンの状態を更新
  updateButtonStates(scene);
}

/**
 * 選択的開示VPのQRコードを生成して表示します。
 * VCから指定シナリオに必要な属性のみを抽出してQRコード化。
 *
 * @param {string} scene - VP生成シナリオ（'identity'または'age'）
 * @returns {Promise<void>}
 */
const generateQRCode = async (scene) => {
  const qrArea = document.getElementById('qr-area');

  // シーン情報
  const scenarios = {
    identity: {
      name: '本人確認',
      data: '氏名、生年月日、住所'
    },
    age: {
      name: '年齢認証',
      data: '成人年齢の証明のみ'
    }
  };

  // 選択的開示VPを生成
  const vpDataString = createSelectiveDisclosureVP(scene);

  if (!vpDataString) {
    throw new Error('VP生成に失敗しました');
  }

  const qrDataString = vpDataString;
  console.log('QRデータサイズ:', qrDataString.length, 'bytes');

  // ローディングを表示してからQRコード生成
  await showLoadingFor();

  // QRコード生成（qrcode-generatorライブラリ使用）
  try {
    const qr = qrcode(10, 'L'); // type: 10 (より大容量), error correction level: L (最小)
    qr.addData(qrDataString);
    qr.make();

    // HTML形式でQRコード生成
    const qrHTML = qr.createImgTag(4, 0); // cell size: 4, margin: 0
    qrArea.innerHTML = qrHTML;
    qrArea.className = 'bg-light border rounded mx-auto d-flex align-items-center justify-content-center';
    qrArea.style.maxWidth = '300px';
    qrArea.style.width = '100%';
    qrArea.style.aspectRatio = '1';

    // QRコード画像のスタイル調整
    const img = qrArea.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
    }

    // QRコード生成完了後に自動スクロール
    setTimeout(() => {
      document.getElementById('qr-area').scrollIntoView({ behavior: 'smooth' });
    }, 100);

  } catch (error) {
    console.error('QRコード生成エラー:', error);
    qrArea.innerHTML = `
      <div class="d-flex align-items-center justify-content-center h-100">
        <div class="text-center text-danger">
          <p class="mb-0">QRコード生成に失敗しました</p>
        </div>
      </div>
    `;
  }
}

/**
 * シナリオ選択ボタンの表示状態を更新します。
 * 選択されたボタンをハイライト表示し、他のボタンは通常表示。
 *
 * @param {string} selectedScene - 選択されたシナリオ
 * @returns {void}
 */
const updateButtonStates = (selectedScene) => {
  // すべての選択ボタンをリセット
  const buttons = document.querySelectorAll('button[data-scene]');
  buttons.forEach(btn => {
    btn.classList.remove('selected');
  });

  // 選択されたボタンのみをハイライト
  const selectedButton = document.querySelector(`button[data-scene="${selectedScene}"]`);
  if (selectedButton) {
    selectedButton.classList.add('selected');
  }
}

