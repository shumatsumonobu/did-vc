import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';
import showLoadingFor from '../lib/showLoadingFor.js';

let selectedScenario = null;
let html5QrCode = null;
let scannedVPData = null;

// === 関数定義 ===

const selectScenario = (scenario) => {
  // console.log('selectScenario() - シナリオ選択:', scenario);
  selectedScenario = scenario;

  // ボタンの状態を更新
  updateButtonStates(scenario);

  // VP読取エリアを直接表示
  document.getElementById('vp-scan-area').style.display = 'block';
  // console.log('VP読取エリア表示完了');


  // スムーズスクロール後に自動でカメラ起動（まだ起動していない場合のみ）
  setTimeout(() => {
    // console.log('スクロール実行');
    document.getElementById('vp-scan-area').scrollIntoView({ behavior: 'smooth' });

    // カメラが未起動の場合のみ自動起動
    // console.log('カメラ状態確認:', { html5QrCode: !!html5QrCode });
    if (!html5QrCode) {
      // console.log('カメラ起動タイマー設定（300ms後）');
      setTimeout(() => {
        startQRScanner();
      }, 300);
    } else {
      // console.log('カメラは既に起動済み');
    }
  }, 100);
};

const startQRScanner = () => {
  // console.log('startQRScanner() - 開始');

  // ライブラリの読み込み確認
  if (typeof Html5Qrcode === 'undefined') {
    console.error('ERROR: Html5Qrcode ライブラリが読み込まれていません');
    alert('QRスキャナーの初期化に失敗しました。ページを再読み込みしてください。');
    return;
  }

  const qrReader = document.getElementById('qr-reader');

  // console.log('要素取得結果:', { qrReader });

  // ローディングを表示
  showLoadingFor();
  // console.log('カメラ起動中のローディング表示開始');

  // console.log('Html5Qrcode インスタンス作成中...');
  html5QrCode = new Html5Qrcode("qr-reader");

  // console.log('カメラ起動開始...');
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
    // console.log('SUCCESS: カメラ起動成功');

    // カメラ起動成功時、カメラビューを表示
    qrReader.style.display = 'block';

    // console.log('カメラビュー表示設定完了:', {
    //   qrReaderDisplay: qrReader.style.display
    // });

    // 要素サイズもチェック
    const rect = qrReader.getBoundingClientRect();
    // console.log('qr-reader 要素サイズ:', {
    //   width: rect.width,
    //   height: rect.height,
    //   visible: rect.width > 0 && rect.height > 0
    // });

    // video要素のサイズを強制的に設定
    setTimeout(() => {
      const videoElement = qrReader.querySelector('video');
      if (videoElement) {
        // console.log('video要素発見、サイズ修正中...');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        // console.log('video要素サイズ修正完了');
      } else {
        // console.log('video要素が見つかりません');
      }
    }, 100);
  }).catch(err => {
    console.error('ERROR: カメラ起動エラー:', err);
    console.error('エラー詳細:', err.message, err.stack);
    alert('カメラの起動に失敗しました。カメラへのアクセス権限を確認してください。');
    resetScanButtons();
  });
};

const stopQRScanner = () => {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      // clear()メソッドが存在する場合のみ呼び出し
      if (typeof html5QrCode.clear === 'function') {
        html5QrCode.clear();
      }
      html5QrCode = null; // カメラインスタンスをリセット
      resetScanButtons();
    }).catch(err => {
      console.error('スキャン停止エラー:', err);
      html5QrCode = null; // エラー時もリセット
      resetScanButtons();
    });
  }
};

const resetScanButtons = () => {
  const qrReader = document.getElementById('qr-reader');

  // リーダーを非表示
  qrReader.style.display = 'none';
};

const showScanSuccess = () => {
  // QRコード読み取り成功をログに記録
  // console.log('QR読み取り成功 - 認証処理開始');
};

const executeAuthentication = () => {
  if (scannedVPData) {
    // ここでVPデータを検証する処理を追加
    // console.log('検証するVPデータ:', scannedVPData);

    // VPデータを簡易検証（実際の実装では署名検証等を行う）
    const isValid = validateVPData(scannedVPData);

    if (isValid) {
      showAuthenticationSuccess();
    } else {
      showAuthenticationFailure();
    }
  }
};

const validateVPData = (vpData) => {
  try {
    // 簡易的な検証（実際の実装では暗号化署名検証を行う）
    const data = JSON.parse(vpData);
    return data && (data.t === 'identity' || data.t === 'age') && data.iss;
  } catch (error) {
    console.error('VP検証エラー:', error);
    return false;
  }
};

const showAuthenticationSuccess = () => {
  // console.log('showAuthenticationSuccess - selectedScenario:', selectedScenario);
  const isIdentityAuth = selectedScenario === 'identity';
  // console.log('showAuthenticationSuccess - isIdentityAuth:', isIdentityAuth);
  const scenarioName = isIdentityAuth ? '本人確認' : '年齢認証';

  const successMessage = isIdentityAuth
    ? '本人確認が完了しました。提示された身元情報の真正性を確認しました。'
    : '年齢認証が完了しました。成人年齢であることを確認しました。';

  const attributeInfo = isIdentityAuth
    ? `<h6 style="font-size: 0.875rem;">確認済み身元情報:</h6>
       <div class="small text-muted" style="font-size: 0.75rem;">
         <p class="mb-1">✓ 氏名: 山田 太郎</p>
         <p class="mb-1">✓ 生年月日: 1990年5月15日</p>
         <p class="mb-1">✓ 住所: 東京都千代田区霞が関1-1-1</p>
         <p class="mb-1 text-success"><strong>本人確認: 承認</strong></p>
         <p class="mb-0 text-end">発行: DID認証機構</p>
       </div>`
    : `<h6 style="font-size: 0.875rem;">確認済み年齢情報:</h6>
       <div class="small text-muted" style="font-size: 0.75rem;">
         <p class="mb-1">✓ 20歳以上であることを確認</p>
         <p class="mb-1 text-success"><strong>年齢認証: 承認</strong></p>
         <p class="mb-0 text-end">発行: DID認証機構</p>
       </div>`;

  Swal.fire({
    icon: 'success',
    title: `${scenarioName}成功`,
    html: `
      <p class="mb-3" style="font-size: 0.8125rem;">${successMessage}</p>
      <hr>
      <div class="text-start" style="font-size: 0.8125rem;">
        ${attributeInfo}
      </div>
    `,
    confirmButtonText: 'OK',
    confirmButtonColor: '#000',
    width: '500px',
    customClass: {
      confirmButton: 'btn btn-dark w-100',
      popup: 'swal-custom-popup',
      title: 'swal-custom-title'
    },
    buttonsStyling: false
  }).then(() => {
    // 認証完了後はスキャン状態に戻す
    resetToScan();
  });
};

const showAuthenticationFailure = () => {
  Swal.fire({
    icon: 'error',
    title: '認証失敗',
    html: `
      <p style="font-size: 0.8125rem; color: #333;">
        VPの認証に失敗しました。デジタル署名の検証でエラーが発生したため、提示されたデータの真正性を確認できませんでした。
      </p>
    `,
    confirmButtonText: 'やり直す',
    confirmButtonColor: '#000',
    width: '450px',
    customClass: {
      confirmButton: 'btn btn-dark w-100',
      popup: 'swal-custom-popup',
      title: 'swal-custom-title'
    },
    buttonsStyling: false
  }).then(() => {
    // 失敗後はスキャン状態に戻す
    resetToScan();
  });
};

const updateButtonStates = (selectedScenario) => {
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
};

const resetToScan = () => {
  // console.log('resetToScan() - スキャン状態に戻る');

  // カメラを停止・再起動
  if (html5QrCode && typeof html5QrCode.stop === 'function') {
    stopQRScanner();
  } else {
    html5QrCode = null;
    resetScanButtons();
  }

  // スキャン済みデータのみリセット（シナリオ選択は維持）
  scannedVPData = null;

  // カメラを再起動
  setTimeout(() => {
    startQRScanner();
  }, 300);
};

const resetToStart = () => {
  // console.log('resetToStart() - 初期状態に戻る');

  // カメラを停止（安全にチェック）
  if (html5QrCode && typeof html5QrCode.stop === 'function') {
    stopQRScanner();
  } else {
    // カメラが未起動または既に停止済みの場合は直接リセット
    html5QrCode = null;
    resetScanButtons();
  }

  // 変数をリセット
  selectedScenario = null;
  scannedVPData = null;

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
};

const showTestResult = (resultType) => {
  // console.log('showTestResult() - テスト結果表示:', resultType);
  // console.log('showTestResult() - 現在のselectedScenario:', selectedScenario);

  // 現在選択されているシナリオがない場合はテスト用にidentityを設定
  if (!selectedScenario) {
    selectedScenario = 'identity';
    // console.log('showTestResult() - シナリオ未選択のため、identityに設定');
  }

  if (resultType === 'success') {
    scannedVPData = `{"t": "${selectedScenario}", "iss": "DID認証機構", "ts": ${Math.floor(Date.now() / 1000)}}`;
    showAuthenticationSuccess();
  } else {
    scannedVPData = '{"invalid": "data"}'; // 無効なデータ
    showAuthenticationFailure();
  }
};

// === イベントリスナー設定 ===

// イベントリスナーを設定
document.getElementById('identity-scenario-btn').addEventListener('click', () => selectScenario('identity'));
document.getElementById('age-scenario-btn').addEventListener('click', () => selectScenario('age'));
document.getElementById('reset-to-start-btn').addEventListener('click', resetToStart);

// === 開発用テストボタンのイベントリスナー（本番時はコメントアウト） ===
document.getElementById('test-success-btn').addEventListener('click', () => showTestResult('success'));
document.getElementById('test-failure-btn').addEventListener('click', () => showTestResult('failure'));
// === 開発用イベントリスナー終了 ===

// === DOM読み込み完了時の処理 ===

// ページ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
  // Html5Qrcodeライブラリの読み込み確認
  const checkLibraryLoaded = () => {
    if (typeof Html5Qrcode !== 'undefined') {
      // console.log('Html5Qrcode ライブラリが正常に読み込まれました');
    } else {
      // console.log('Html5Qrcode ライブラリを待機中...');
      setTimeout(checkLibraryLoaded, 100);
    }
  };

  // ライブラリ読み込み確認を開始
  checkLibraryLoaded();
});