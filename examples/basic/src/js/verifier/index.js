import { Html5Qrcode } from 'html5-qrcode';
import { showLoadingFor } from '../lib/loading.js';

let selectedScenario = null;
let html5QrCode = null;
let scannedVPData = null;

// イベントリスナーを設定
document.getElementById('identity-scenario-btn').addEventListener('click', () => selectScenario('identity'));
document.getElementById('age-scenario-btn').addEventListener('click', () => selectScenario('age'));
document.getElementById('reset-to-start-btn').addEventListener('click', resetToStart);

// === 開発用テストボタンのイベントリスナー（本番時はコメントアウト） ===
document.getElementById('test-success-btn').addEventListener('click', () => showTestResult('success'));
document.getElementById('test-failure-btn').addEventListener('click', () => showTestResult('failure'));
// === 開発用イベントリスナー終了 ===

function selectScenario(scenario) {
  console.log('selectScenario() - シナリオ選択:', scenario);
  selectedScenario = scenario;

  // ボタンの状態を更新
  updateButtonStates(scenario);

  // VP読取エリアを直接表示
  document.getElementById('vp-scan-area').style.display = 'block';
  console.log('VP読取エリア表示完了');

  // 選択したシナリオ情報を更新
  const scenarioName = selectedScenario === 'identity' ? '本人確認認証' : '年齢認証アプリ';
  document.querySelector('#vp-scan-area .alert-info strong').textContent = scenarioName;
  console.log('シナリオ名設定:', scenarioName);

  // スムーズスクロール後に自動でカメラ起動（まだ起動していない場合のみ）
  setTimeout(() => {
    console.log('スクロール実行');
    document.getElementById('vp-scan-area').scrollIntoView({ behavior: 'smooth' });

    // カメラが未起動の場合のみ自動起動
    console.log('カメラ状態確認:', { html5QrCode: !!html5QrCode });
    if (!html5QrCode) {
      console.log('カメラ起動タイマー設定（300ms後）');
      setTimeout(() => {
        startQRScanner();
      }, 300);
    } else {
      console.log('カメラは既に起動済み');
    }
  }, 100);
}

function startQRScanner() {
  console.log('startQRScanner() - 開始');

  // ライブラリの読み込み確認
  if (typeof Html5Qrcode === 'undefined') {
    console.error('ERROR: Html5Qrcode ライブラリが読み込まれていません');
    alert('QRスキャナーの初期化に失敗しました。ページを再読み込みしてください。');
    return;
  }

  const qrReader = document.getElementById('qr-reader');

  console.log('要素取得結果:', { qrReader });

  // ローディングを表示
  showLoadingFor(800);
  console.log('カメラ起動中のローディング表示開始');

  console.log('Html5Qrcode インスタンス作成中...');
  html5QrCode = new Html5Qrcode("qr-reader");

  console.log('カメラ起動開始...');
  html5QrCode.start(
    { facingMode: "environment" }, // リアカメラを優先
    {
      fps: 10,    // フレームレート
      qrbox: { width: 250, height: 250 }, // スキャンエリア
      aspectRatio: 1.0
    },
    (decodedText, decodedResult) => {
      // QRコード読み取り成功
      console.log('QRコード読み取り成功:', decodedText);
      scannedVPData = decodedText;

      // スキャンを停止
      stopQRScanner();

      // 成功メッセージを表示
      showScanSuccess();

      // 自動で認証実行（少し遅延を入れて視覚的に認識しやすく）
      setTimeout(() => {
        executeAuthentication();
      }, 1000);
    },
    (errorMessage) => {
      // エラーは無視（継続的にスキャンするため）
    }
  ).then(() => {
    console.log('SUCCESS: カメラ起動成功');

    // カメラ起動成功時、カメラビューを表示
    qrReader.style.display = 'block';

    console.log('カメラビュー表示設定完了:', {
      qrReaderDisplay: qrReader.style.display
    });

    // 要素サイズもチェック
    const rect = qrReader.getBoundingClientRect();
    console.log('qr-reader 要素サイズ:', {
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });

    // video要素のサイズを強制的に設定
    setTimeout(() => {
      const videoElement = qrReader.querySelector('video');
      if (videoElement) {
        console.log('video要素発見、サイズ修正中...');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        console.log('video要素サイズ修正完了');
      } else {
        console.log('video要素が見つかりません');
      }
    }, 100);
  }).catch(err => {
    console.error('ERROR: カメラ起動エラー:', err);
    console.error('エラー詳細:', err.message, err.stack);
    alert('カメラの起動に失敗しました。カメラへのアクセス権限を確認してください。');
    resetScanButtons();
  });
}

function stopQRScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null; // カメラインスタンスをリセット
      resetScanButtons();
    }).catch(err => {
      console.error('スキャン停止エラー:', err);
      html5QrCode = null; // エラー時もリセット
      resetScanButtons();
    });
  }
}

function resetScanButtons() {
  const qrReader = document.getElementById('qr-reader');

  // リーダーを非表示
  qrReader.style.display = 'none';
}

function showScanSuccess() {
  // QRコード読み取り成功をログに記録
  console.log('QR読み取り成功 - 認証処理開始');
}

function executeAuthentication() {
  if (scannedVPData) {
    // ここでVPデータを検証する処理を追加
    console.log('検証するVPデータ:', scannedVPData);

    // 認証結果エリアを表示
    document.getElementById('result-area').style.display = 'block';

    // スムーズスクロール
    document.getElementById('result-area').scrollIntoView({ behavior: 'smooth' });
  }
}

// ページ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
  // Html5Qrcodeライブラリの読み込み確認
  function checkLibraryLoaded() {
    if (typeof Html5Qrcode !== 'undefined') {
      console.log('Html5Qrcode ライブラリが正常に読み込まれました');
    } else {
      console.log('Html5Qrcode ライブラリを待機中...');
      setTimeout(checkLibraryLoaded, 100);
    }
  }

  // ライブラリ読み込み確認を開始
  checkLibraryLoaded();
});

function updateButtonStates(selectedScenario) {
  // すべての選択ボタンをリセット
  const buttons = document.querySelectorAll('button[data-scenario]');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-dark');
  });

  // 選択されたボタンのみをハイライト
  const selectedButton = document.querySelector(`button[data-scenario="${selectedScenario}"]`);
  if (selectedButton) {
    selectedButton.classList.remove('btn-outline-dark');
    selectedButton.classList.add('btn-primary');
  }
}

function resetToStart() {
  console.log('resetToStart() - 初期状態に戻る');

  // カメラを停止
  if (html5QrCode) {
    stopQRScanner();
  }

  // 変数をリセット
  selectedScenario = null;
  scannedVPData = null;
  html5QrCode = null; // カメラインスタンスを確実にリセット

  // 表示エリアを初期状態に戻す
  document.getElementById('vp-scan-area').style.display = 'none';
  document.getElementById('result-area').style.display = 'none';

  // ボタンの状態をリセット
  const buttons = document.querySelectorAll('button[data-scenario]');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-dark');
  });

  // シナリオ選択画面までスクロール
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
}

// === 開発用テスト関数（本番時はコメントアウト） ===
function showTestResult(resultType) {
  console.log('showTestResult() - テスト結果表示:', resultType);

  // ダミーデータを設定
  selectedScenario = 'identity'; // テスト用のシナリオ設定
  scannedVPData = resultType === 'success' ? '{"test": "success"}' : '{"test": "failure"}';

  // VP読取エリアを非表示
  document.getElementById('vp-scan-area').style.display = 'none';

  // 結果表示を切り替え
  const resultArea = document.getElementById('result-area');
  const successAlert = resultArea.querySelector('.alert-success');
  const failureAlert = resultArea.querySelector('.alert-danger');

  if (resultType === 'success') {
    successAlert.style.display = 'block';
    failureAlert.style.display = 'none';
  } else {
    successAlert.style.display = 'none';
    failureAlert.style.display = 'block';
  }

  // 認証結果エリアを表示
  resultArea.style.display = 'block';

  // スムーズスクロール
  resultArea.scrollIntoView({ behavior: 'smooth' });
}
// === 開発用テスト関数終了 ===