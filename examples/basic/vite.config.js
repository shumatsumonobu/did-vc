import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // ベースパス設定（相対パスでビルド）
  base: './',

  // 開発サーバー設定
  root: 'src', // src/ をルートディレクトリに設定
  server: {
    port: 5173,
    open: '/index.html' // 開発時のデフォルトページ
  },

  // ビルド設定
  build: {
    outDir: '../dist', // rootがsrcなので、相対パスで上位ディレクトリのdistを指定
    emptyOutDir: true,

    // 複数エントリーポイントの定義
    rollupOptions: {
      input: {
        // Main entry page
        'index': resolve(__dirname, 'src/index.html'),

        // Holder pages
        'holder/index': resolve(__dirname, 'src/holder/index.html'),
        'holder/credentials': resolve(__dirname, 'src/holder/credentials.html'),
        'holder/presentation': resolve(__dirname, 'src/holder/presentation.html'),

        // Verifier pages
        'verifier/index': resolve(__dirname, 'src/verifier/index.html')
      },

      output: {
        // アセットファイル名の設定
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/main-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        },

        // チャンクファイル名の設定
        chunkFileNames: (chunkInfo) => {
          // holder関連のJSファイル
          if (chunkInfo.name.includes('holder')) {
            return 'assets/js/holder-[hash].js';
          }
          // verifier関連のJSファイル
          if (chunkInfo.name.includes('verifier')) {
            return 'assets/js/verifier-[hash].js';
          }
          return 'assets/js/[name]-[hash].js';
        },

        // エントリーファイル名の設定
        entryFileNames: (chunkInfo) => {
          // holder関連のJSファイル
          if (chunkInfo.name.includes('holder')) {
            return 'assets/js/holder-[hash].js';
          }
          // verifier関連のJSファイル
          if (chunkInfo.name.includes('verifier')) {
            return 'assets/js/verifier-[hash].js';
          }
          return 'assets/js/[name]-[hash].js';
        }
      }
    }
  },

  // エイリアス設定（開発時の便利機能）
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@js': resolve(__dirname, 'src/js'),
      '@css': resolve(__dirname, 'src/css')
    }
  },

  // CSS設定
  css: {
    devSourcemap: true
  }
});