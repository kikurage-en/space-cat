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
| Node.js | 20.19+ または 22.12+（Vite 8の要件） |
| 最終確認日 | 2026-04-10 |

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
| bg/*.webp | 宇宙背景 本体 12枚（1920x1920） | WebP |
| bg-thumb/*.webp | 背景サムネイル 12枚（128x128） | WebP |
| ogp.jpg | OGP / Twitterカード画像 | JPEG |
| ogp.png | OGP画像（元データ） | PNG |
| ogp.webp | OGP画像（WebP版） | WebP |
| sample-result.webp | 生成サンプル画像（フッターに表示、800x800） | WebP |
| sample.webp | 未参照（index.html から使用されていない） | WebP |
| sample.png | 未参照（index.html から使用されていない） | PNG |

### 背景画像

ファイル名（id）とクレジットの一覧は `src/main.ts` の `BACKGROUNDS` 配列を参照。
`bg/<id>.webp` と `bg-thumb/<id>.webp` が id ごとに対になる。

| 項目 | 内容 |
|------|------|
| 本体解像度 | 1920x1920（正方形センタークロップ） |
| サムネ解像度 | 128x128 |
| 出典 | NASA Image and Video Library（`images-api.nasa.gov`） |
| ライセンス | NASA制作コンテンツはパブリックドメイン。個別クレジットは `BACKGROUNDS` に保持し、UI上に表示する |
| 読み込み方式 | サムネのみ先行、本体は選択時にオンデマンド取得 |

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
