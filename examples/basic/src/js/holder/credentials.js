import { showLoadingFor } from '../lib/loading.js';

async function submitApplication() {
  // フォームデータを取得
  const name = document.getElementById('fullName').value;
  const birth = document.getElementById('birthDate').value;
  const address = document.getElementById('address').value;
  const gender = document.querySelector('input[name="gender"]:checked').nextElementSibling.textContent;

  // VC発行処理をシミュレート（1秒のローディング）
  await showLoadingFor(1000);

  // VC内容を設定
  document.getElementById('vc-name').textContent = name;
  document.getElementById('vc-birth').textContent = new Date(birth).toLocaleDateString('ja-JP');
  document.getElementById('vc-address').textContent = address;
  document.getElementById('vc-gender').textContent = gender;

  // 画面を切り替え
  document.getElementById('application-form').style.display = 'none';
  document.getElementById('credentials-list').style.display = 'block';

  // セッションストレージに状態を保存
  sessionStorage.setItem('applicationSubmitted', 'true');
  sessionStorage.setItem('applicationData', JSON.stringify({name, birth, address, gender}));
}

function resetApplication() {
  // 画面を切り替え
  document.getElementById('credentials-list').style.display = 'none';
  document.getElementById('application-form').style.display = 'block';

  // セッションストレージをクリア
  sessionStorage.removeItem('applicationSubmitted');
  sessionStorage.removeItem('applicationData');
}

// イベントリスナーを設定
document.getElementById('submit-btn').addEventListener('click', submitApplication);
document.getElementById('reset-btn').addEventListener('click', resetApplication);

// ページ読み込み時に状態を復元
window.addEventListener('DOMContentLoaded', function() {
  if (sessionStorage.getItem('applicationSubmitted') === 'true') {
    const data = JSON.parse(sessionStorage.getItem('applicationData') || '{}');
    if (data.name) {
      // VC内容を復元
      document.getElementById('vc-name').textContent = data.name;
      document.getElementById('vc-birth').textContent = new Date(data.birth).toLocaleDateString('ja-JP');
      document.getElementById('vc-address').textContent = data.address;
      document.getElementById('vc-gender').textContent = data.gender;

      document.getElementById('application-form').style.display = 'none';
      document.getElementById('credentials-list').style.display = 'block';
    }
  }
});