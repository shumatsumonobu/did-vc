import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';
import showLoadingFor from '../lib/showLoadingFor.js';
import { validateVP, verifyVCSignature, createSelectiveDisclosureVP } from '../lib/vcManager.js';

let selectedScenario = null;
let html5QrCode = null;
let scannedVPData = null;

// === 関数定義 ===

/**
 * 認証シナリオを選択してQRスキャン準備を開始します。
 * ボタン状態更新、VP読取エリア表示、自動カメラ起動を実行。
 *
 * @param {string} scenario - 認証シナリオ（'identity'または'age'）
 * @returns {void}
 */
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

/**
 * QRコードスキャナーを開始します。
 * Html5Qrcodeライブラリを使用してリアカメラでQR読み取りを実行。
 * 読み取り成功時は自動で認証処理を開始。
 *
 * @returns {void}
 */
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

  // 画面サイズに応じてQRスキャンエリアのサイズを調整
  const qrReaderElement = document.getElementById('qr-reader');
  const containerWidth = qrReaderElement.offsetWidth;
  const qrBoxSize = Math.min(containerWidth * 0.8, 320); // コンテナの80%、最大320px

  // console.log('カメラ起動開始...');
  html5QrCode.start(
    { facingMode: "environment" }, // リアカメラを優先
    {
      fps: 10,    // フレームレート
      qrbox: { width: qrBoxSize, height: qrBoxSize }, // スキャンエリア
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

/**
 * VPデータの認証処理を実行します。
 * スキャンされたVPデータを検証し、成功・失敗に応じた結果表示を行う。
 *
 * @returns {void}
 */
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

/**
 * VPデータの検証を行います。
 * lib/vcManager.jsのvalidateVP関数を使用してVP検証を実行。
 *
 * @param {string} vpData - 検証するVPデータ（JSON文字列）
 * @returns {boolean} 検証成功時はtrue、失敗時はfalse
 */
const validateVPData = (vpData) => {
  return validateVP(vpData);
};


/**
 * 認証成功時の結果表示を行います。
 * SweetAlert2を使用して認証成功メッセージと確認済み属性情報を表示。
 *
 * @returns {void}
 */
const showAuthenticationSuccess = () => {
  // console.log('showAuthenticationSuccess - selectedScenario:', selectedScenario);
  const isIdentityAuth = selectedScenario === 'identity';
  // console.log('showAuthenticationSuccess - isIdentityAuth:', isIdentityAuth);
  const scenarioName = isIdentityAuth ? '本人確認' : '年齢認証';

  const successMessage = isIdentityAuth
    ? '本人確認が完了しました。提示された身元情報の真正性を確認しました。'
    : '年齢認証が完了しました。成人年齢であることを確認しました。';

  // VPデータから実際の情報を取得（Base64デコード対応）
  let vpInfo = null;
  try {
    // Base64デコードしてからJSONパース
    const decodedData = decodeURIComponent(escape(atob(scannedVPData)));
    vpInfo = JSON.parse(decodedData);
  } catch (e) {
    console.error('VP検証エラー:', e);
    vpInfo = null;
  }

  const attributeInfo = isIdentityAuth
    ? `<h6 style="font-size: 0.875rem;">確認済み身元情報:</h6>
       <div class="small text-muted" style="font-size: 0.75rem;">
         ${vpInfo?.name ? `<p class="mb-1">✓ 氏名: ${vpInfo.name}</p>` : '<p class="mb-1 text-danger">⚠ 氏名データなし</p>'}
         ${vpInfo?.birth ? `<p class="mb-1">✓ 生年月日: ${new Date(vpInfo.birth).toLocaleDateString('ja-JP')}</p>` : '<p class="mb-1 text-danger">⚠ 生年月日データなし</p>'}
         ${vpInfo?.addr ? `<p class="mb-1">✓ 住所: ${vpInfo.addr}</p>` : '<p class="mb-1 text-danger">⚠ 住所データなし</p>'}
         <p class="mb-1 text-success"><strong>本人確認: 承認</strong></p>
         <p class="mb-0 text-end">発行: DID認証機構</p>
       </div>`
    : `<h6 style="font-size: 0.875rem;">確認済み年齢情報:</h6>
       <div class="small text-muted" style="font-size: 0.75rem;">
         ${vpInfo?.birth ? `<p class="mb-1">✓ 生年月日: ${new Date(vpInfo.birth).toLocaleDateString('ja-JP')} (成人確認済み)</p>` : '<p class="mb-1">✓ 20歳以上であることを確認</p>'}
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

/**
 * 認証失敗時の結果表示を行います。
 * SweetAlert2を使用して認証失敗メッセージを表示。
 *
 * @returns {void}
 */
const showAuthenticationFailure = () => {
  Swal.fire({
    icon: 'error',
    title: '認証失敗',
    html: `
      <p class="text-muted" style="font-size: 0.8125rem;">
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
    btn.classList.remove('selected');
  });

  // 選択されたボタンのみをハイライト
  const selectedButton = document.querySelector(`button[data-scenario="${selectedScenario}"]`);
  if (selectedButton) {
    selectedButton.classList.add('selected');
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
    btn.classList.remove('selected');
  });

  // シナリオ選択画面までスクロール
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
};

/**
 * 開発用テスト結果を表示します。
 * 実際のVCから生成されたVPデータまたは無効データで認証テストを実行。
 *
 * @param {string} resultType - テストタイプ（'success'または'failure'）
 * @returns {void}
 */
const showTestResult = (resultType) => {
  // console.log('showTestResult() - テスト結果表示:', resultType);
  // console.log('showTestResult() - 現在のselectedScenario:', selectedScenario);

  // 現在選択されているシナリオがない場合はテスト用にidentityを設定
  if (!selectedScenario) {
    selectedScenario = 'identity';
    // console.log('showTestResult() - シナリオ未選択のため、identityに設定');
  }

  if (resultType === 'success') {
    // 実際のVCから選択的開示VPを生成
    const realVPData = createSelectiveDisclosureVP(selectedScenario);
    if (realVPData) {
      scannedVPData = realVPData;
      showAuthenticationSuccess();
    } else {
      // VCが存在しない場合は固定テストデータを使用
      scannedVPData = `{"t": "${selectedScenario}", "iss": "did:demo:issuer-001", "ts": ${Math.floor(Date.now() / 1000)}}`;
      showAuthenticationSuccess();
    }
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
  // 開発者モードチェック (?dev=1 パラメータで制御)
  const urlParams = new URLSearchParams(window.location.search);
  const isDevMode = urlParams.get('dev') === '1';

  if (isDevMode) {
    // 開発者用テストボタンを表示
    const devTools = document.getElementById('dev-tools');
    if (devTools) {
      devTools.style.display = 'block';
      console.log('開発者モードが有効です (?dev=1)');
    }
  }

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