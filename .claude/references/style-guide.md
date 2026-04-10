# スタイルガイド

> このファイルは以下の情報の **Truth Source** です：
> - デザインシステム（カラー、タイポグラフィ、スペーシング）
> - CSSコーディング規約
> - TypeScriptコーディング規約
> - コミットメッセージ規約

## デザインシステム

### カラーパレット

| 用途 | カラー | CSS変数候補 |
|------|--------|------------|
| 背景（メイン） | `#0a0a1a` | --color-bg（深い宇宙） |
| テキスト（メイン） | `#fff` | --color-text |
| テキスト（補助） | `#888` | --color-text-muted |
| テキスト（薄い） | `#555` | --color-text-dim |
| アクセント（パープル） | `#9b59b6` | --color-accent |
| アクセント（シアン） | `#00d4ff` | --color-accent-bright |
| アクセントグラデーション | `linear-gradient(135deg, #9b59b6, #00d4ff)` | --gradient-accent |
| ボーダー | `#333` | --color-border |
| ボタン背景（薄い） | `rgba(255, 255, 255, 0.08)` | --color-btn-ghost |
| ボタン（共通） | `linear-gradient(135deg, #9b59b6, #00d4ff)` | --gradient-primary |
| オーバーレイ | `rgba(0, 0, 0, 0.7)` | --color-overlay |

### タイポグラフィ

| 要素 | サイズ | ウェイト | 色 |
|------|--------|---------|-----|
| h1（タイトル） | 22px | 700 | グラデーション（purple→cyan） |
| サブタイトル | 13px | 通常 | #888 |
| ボタン | 14px | 600 | 各ボタンによる |
| ヒントテキスト | 11px | 通常 | #555 |
| フッター | 12px | 通常 | #555 |
| トースト | 14px | 600 | #1a1a2e（背景: 白） |

### フォントファミリー

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### レイアウト

| 項目 | 値 |
|------|-----|
| コンテナ最大幅 | 480px |
| パディング（横） | 16px |
| パディング（上） | 20px |
| パディング（下） | 40px + safe-area-inset-bottom |
| ボーダー半径（カード） | 16px |
| ボーダー半径（ボタン） | 10px |
| ボタン高さ | 44px（タップターゲット推奨サイズ） |

### アニメーション

| 名前 | 用途 | 設定 |
|------|------|------|
| spin | スピナー回転 | 0.8s linear infinite |
| drag-guide-bounce | ドラッグガイド上下 | 1.2s ease-in-out infinite、translateY(-6px) |
| drag-guide-fade-in | ガイド出現 | 0.4s ease-out |
| drag-guide-fade-out | ガイド消失 | 0.6s ease-out forwards |
| ボタン押下 | scale(0.95) | transition 0.2s |
| アップロードエリア押下 | scale(0.98) | transition 0.2s |

### インタラクション

| 要素 | ホバー | アクティブ |
|------|--------|----------|
| アップロードエリア | border-color: #9b59b6, bg: rgba(9b59b6, 0.05) | scale(0.98) |
| ボタン（共通） | - | scale(0.95) |
| アイコンボタン | - | scale(0.92), bg: rgba(fff, 0.15) |
| ハッシュタグ | - | color: #00d4ff |

## CSS規約

### 命名

| 対象 | ルール | 例 |
|------|--------|-----|
| CSSクラス | kebab-case | `.upload-area`, `.preview-section`, `.btn-primary` |
| id | kebab-case | `#result-canvas`, `#file-input` |
| BEM風の修飾子 | `-修飾子` | `.btn-tweet`, `.btn-share`, `.btn-primary` |

### 背景セレクター（`.bg-selector`）

```css
.bg-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;          /* 横スクロール（将来の背景追加に備える） */
  -webkit-overflow-scrolling: touch;
}

.bg-thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.2s;
}

.bg-thumb.active {
  border-color: #00d4ff;     /* アクセントカラー */
  opacity: 1;
}

.bg-thumb:active {
  transform: scale(0.92);
}
```

### 構成

- `hidden` クラスで表示切替: `display: none !important`
- CSS変数は未使用（直接値指定）
- メディアクエリなし（max-width: 480px のコンテナで対応）

## TypeScript規約

### 基本ルール

| ルール | 例 |
|--------|-----|
| 変数・関数: camelCase | `subjectScale`, `renderResult`, `processImage` |
| 定数: camelCase | `canvas`, `uploadArea`（DOM参照） |
| ファイル名: kebab-case | `main.ts`, `style.css` |

### DOM要素取得パターン

```typescript
// id指定で取得、型アサーション使用
const canvas = document.getElementById('result-canvas') as HTMLCanvasElement
const fileInput = document.getElementById('file-input') as HTMLInputElement
const uploadArea = document.getElementById('upload-area')!
```

### 状態管理パターン

```typescript
// モジュールスコープの変数で管理（React/フレームワーク不使用）
let subjectX = 0.5
let subjectY = 0.7
let subjectScale = 0.7
let subjectRotation = 0
let subjectFlipped = false
```

## Gitコミット規約

### フォーマット

```
[種別] 変更内容の要約
```

### 種別

| 種別 | 用途 |
|------|------|
| 追加 | 新機能 |
| 修正 | バグ修正 |
| 改善 | リファクタリング、パフォーマンス |
| 設定 | 設定ファイル変更 |
| 文書 | ドキュメント変更 |

## 関連ドキュメント

- 環境仕様: .claude/references/environment-spec.md
- 検証ガイドライン: .claude/references/verification-guidelines.md
