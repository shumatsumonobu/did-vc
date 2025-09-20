/**
 * 共通ローディング機能を提供します。
 * 指定時間ローディングスピナーを表示し、完了後に自動で非表示にします。
 * 既存のローディングがある場合は削除してから新しいローディングを表示。
 *
 * @param {number} [duration=500] - ローディング表示時間（ミリ秒）
 * @returns {Promise<void>} ローディング完了を示すPromise
 */
export default async (duration = 500) => {
  // 既存のローディングがある場合は削除
  const existingOverlay = document.querySelector('.loading-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // ローディングオーバーレイを作成
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.innerHTML = `
    <div class="loading-spinner">
      <svg viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20"></circle>
      </svg>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  // 指定時間後に削除
  return new Promise(resolve => {
    setTimeout(() => {
      if (loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
      }
      resolve();
    }, duration);
  });
};