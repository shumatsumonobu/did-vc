import qrcode from 'qrcode-generator';
import { showLoadingFor } from '../lib/loading.js';

let selectedScenario = null;

// イベントリスナーを設定
document.getElementById('identity-btn').addEventListener('click', () => selectScene('identity'));
document.getElementById('age-btn').addEventListener('click', () => selectScene('age'));

// ページ読み込み時にVC発行状態をチェック
window.addEventListener('load', function() {
  // QRCodeライブラリの読み込み確認
  if (typeof qrcode === 'undefined') {
    console.error('QRCodeライブラリが読み込まれていません');
  } else {
    console.log('QRCodeライブラリが正常に読み込まれました');
  }

  // VC発行状態を確認
  checkVCStatus();
});

function checkVCStatus() {
  const hasVC = sessionStorage.getItem('applicationSubmitted') === 'true';

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

function selectScene(scene) {
  selectedScenario = scene;

  // QRコード生成をシミュレート
  generateQRCode(scene);

  // ボタンの状態を更新
  updateButtonStates(scene);
}

async function generateQRCode(scene) {
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

  // 実際のQRコード生成（データを簡略化）
  const vpData = {
    t: scene, // type -> t
    ts: Math.floor(Date.now() / 1000), // timestamp -> ts (秒単位)
    iss: "DID認証機構" // issuer -> iss
  };

  const qrDataString = JSON.stringify(vpData);
  console.log('QRデータサイズ:', qrDataString.length, 'bytes');

  // 500msのローディングを表示してからQRコード生成
  await showLoadingFor(500);

  // QRコード生成（qrcode-generatorライブラリ使用）
  try {
    const qr = qrcode(10, 'L'); // type: 10 (より大容量), error correction level: L (最小)
    qr.addData(qrDataString);
    qr.make();

    // HTML形式でQRコード生成
    const qrHTML = qr.createImgTag(4, 0); // cell size: 4, margin: 0
    qrArea.innerHTML = qrHTML;
    qrArea.className = 'bg-light border rounded mx-auto d-flex align-items-center justify-content-center';
    qrArea.style.width = '300px';
    qrArea.style.height = '300px';

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

function updateButtonStates(selectedScene) {
  // すべての選択ボタンをリセット
  const buttons = document.querySelectorAll('button[data-scene]');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-dark');
  });

  // 選択されたボタンのみをハイライト
  const selectedButton = document.querySelector(`button[data-scene="${selectedScene}"]`);
  if (selectedButton) {
    selectedButton.classList.remove('btn-outline-dark');
    selectedButton.classList.add('btn-primary');
  }
}

function resetSelection() {
  selectedScenario = null;

  // QRエリアをリセット
  document.getElementById('qr-area').innerHTML = `
    <div class="d-flex align-items-center justify-content-center h-100">
      <div class="text-muted">
        <p class="mb-2">QRコード</p>
        <small>認証方式を選択すると生成されます</small>
      </div>
    </div>
  `;

  // ボタンの状態をリセット
  const buttons = document.querySelectorAll('button[data-scene]');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-dark');
  });
}