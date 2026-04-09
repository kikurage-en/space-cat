# 技術スタック仕様

> このファイルは以下の情報の **Truth Source** です：
> - 使用ライブラリとバージョン
> - TypeScript設定
> - ブラウザ互換性要件
> - GitHub Pages デプロイ設定

## 概要

| 項目 | 内容 |
|------|------|
| プラットフォーム | ブラウザ（静的Webアプリ） |
| ホスティング | GitHub Pages |
| ライセンス | AGPL-3.0-only |
| パッケージマネージャ | pnpm |
| 最終確認日 | 2026-04-09 |

## 依存関係

### プロダクション

| パッケージ | バージョン | 用途 | ライセンス |
|-----------|-----------|------|-----------|
| @imgly/background-removal | ^1.7.0 | AI背景除去 | AGPL-3.0 |

### 開発

| パッケージ | バージョン | 用途 | ライセンス |
|-----------|-----------|------|-----------|
| typescript | ~6.0.2 | 型安全な開発 | Apache-2.0 |
| vite | ^8.0.4 | ビルドツール | MIT |

### 間接依存（@imgly/background-removal 経由）

| パッケージ | 用途 |
|-----------|------|
| ONNX Runtime Web | ブラウザ内AI推論（WebAssembly/WebGL） |

## TypeScript設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**注意**: `strict: true` は設定されていない。元リポジトリに合わせた設定。

## ブラウザAPI使用一覧

| API | 用途 | 備考 |
|-----|------|------|
| Canvas API | 画像合成・描画 | 2D Context |
| File API | 画像アップロード | `<input type="file" accept="image/*">` |
| Drag and Drop API | ドラッグ&ドロップ | `dragover`, `drop` イベント |
| URL.createObjectURL | Blob→URL変換 | プレビュー・ダウンロード |
| Web Share API | モバイルシェア | `navigator.share()`, `navigator.canShare()` |
| Clipboard API | クリップボードコピー | `navigator.clipboard.write()` / `writeText()` |
| Touch Events | ピンチ操作 | `touchstart`, `touchmove`, `touchend` |
| requestAnimationFrame | レンダリング制御 | スロットリング用 |

## 対応ブラウザ

| ブラウザ | 対応 | 備考 |
|---------|------|------|
| Chrome 90+ | ✅ | 推奨 |
| Firefox 90+ | ✅ | |
| Safari 15+ | ✅ | WebAssembly対応必須 |
| Edge 90+ | ✅ | |
| モバイルChrome | ✅ | メモリ制約に注意 |
| モバイルSafari | ✅ | メモリ制約に注意 |

### 非対応・制約

| 制約 | 理由 |
|------|------|
| IE11 | ES2023ターゲット、WebAssembly必須 |
| WebAssembly非対応ブラウザ | ONNX Runtime Web の前提条件 |
| 大画像（10MB超） | メモリフォールバック最小512pxでも処理不可の場合あり |

## 静的ファイル（public/）

| ファイル | 用途 | 形式 |
|---------|------|------|
| bg/galaxy.webp | 渦巻銀河（デフォルト背景） | WebP |
| bg/nebula.webp | カラフルな星雲 | WebP |
| bg/deep-space.webp | 暗い星空・天の川 | WebP |
| bg/planet.webp | 惑星の近景 | WebP |
| bg-thumb/galaxy.webp | サムネイル: 銀河 | WebP |
| bg-thumb/nebula.webp | サムネイル: 星雲 | WebP |
| bg-thumb/deep-space.webp | サムネイル: 深宇宙 | WebP |
| bg-thumb/planet.webp | サムネイル: 惑星 | WebP |
| sample.webp | サンプル画像・OGP画像 | WebP |
| sample.png | サンプル画像（フォールバック） | PNG |

## GitHub Pages 設定

| 項目 | 設定値 |
|------|--------|
| Source | GitHub Actions |
| ビルドコマンド | `pnpm build` |
| 出力ディレクトリ | `dist` |
| `base` 設定 | `/[リポジトリ名]/` |

## 公式リソース

| リソース | URL |
|---------|-----|
| Vite | https://vite.dev/ |
| TypeScript | https://www.typescriptlang.org/ |
| @imgly/background-removal | https://github.com/imgly/background-removal-js |
| ONNX Runtime Web | https://onnxruntime.ai/ |
| GitHub Pages | https://docs.github.com/pages |
| 元リポジトリ | https://github.com/nyanko3141592/InspirationCat |

## 関連ドキュメント

- スタイルガイド: .claude/references/style-guide.md
- 検証ガイドライン: .claude/references/verification-guidelines.md
