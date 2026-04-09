---
name: dev
description: |
  space-cat の開発を支援する。
  動物写真の背景を宇宙に差し替えるブラウザ完結型Webアプリの構築・改善・デプロイをサポート。

  [起動条件] /dev、「開発を始める」「実装を進める」「ビルドして」等
---

# space-cat - メインスキル

動物写真の背景を除去し、銀河・星雲の宇宙背景と合成して「宇宙猫」ミーム画像を生成するブラウザ完結型Webアプリ。

## 概要

- **分野**: ソフトウェア開発
- **目的**: 動物写真を宇宙背景と合成するミーム画像ジェネレーターの構築
- **使用技術**: Vite 8.x, TypeScript 6.x, @imgly/background-removal 1.7.x
- **ホスティング**: GitHub Pages（0円運用）
- **ライセンス**: AGPL-3.0-only（@imgly/background-removal に起因）
- **パッケージマネージャ**: pnpm

## アーキテクチャ

```
ユーザー（ブラウザ）
    │
    ├── 画像アップロード（タップ/クリック or ドラッグ&ドロップ）
    │
    ├── リサイズ（メモリ対策: 1024→768→512px フォールバック）
    │
    ├── @imgly/background-removal（ONNX Runtime Web）
    │   └── ブラウザ内でAI推論 → 背景除去 → Blob生成
    │
    ├── Canvas API（合成・編集）
    │   ├── 4種類の宇宙背景から選択（UI切替）
    │   ├── 被写体を重ねて描画（位置・スケール・回転・反転）
    │   └── requestAnimationFrame でスロットリング
    │
    ├── 出力（PNG形式）
    │   ├── モバイル: Web Share API（保存/シェア）
    │   ├── デスクトップ: ダウンロードリンク / クリップボードコピー
    │   └── X投稿: intent URL で別タブ
    │
    └── GitHub Pages（静的ホスティング）
        └── サーバーサイド処理なし
```

## プロジェクト構成

```
space-cat/
├── public/               # 静的ファイル
│   ├── bg/               # 宇宙背景画像（4種類）
│   │   ├── galaxy.webp       # 渦巻銀河
│   │   ├── nebula.webp       # カラフルな星雲
│   │   ├── deep-space.webp   # 暗い星空・天の川
│   │   └── planet.webp       # 惑星の近景
│   ├── bg-thumb/         # 背景選択用サムネイル（4種類）
│   │   ├── galaxy.webp
│   │   ├── nebula.webp
│   │   ├── deep-space.webp
│   │   └── planet.webp
│   └── sample.webp/png   # サンプル画像（OGP用）
├── src/
│   ├── main.ts           # エントリポイント（全ロジック）
│   └── style.css         # スタイルシート
├── index.html            # HTMLテンプレート
├── package.json          # 依存関係（AGPL-3.0-only）
├── tsconfig.json         # TypeScript設定（target: es2023）
└── .github/workflows/    # GitHub Actionsデプロイ設定
```

## 主要機能の実装仕様

### 機能1: 画像アップロード
- **タップ/クリック**: `<input type="file" accept="image/*">` をトリガー
- **ドラッグ&ドロップ**: `dragover`/`drop` イベント、`image/*` のみ受け付け
- **ホバー効果**: ドラッグ中にボーダー色を `#ffd700` に変更

### 機能2: 背景除去（ブラウザ内AI推論）
- **ライブラリ**: `@imgly/background-removal` の `removeBackground()` を使用
- **メモリ対策**: 処理前に画像をリサイズ（1024→768→512px の3段階フォールバック）
- **プログレス表示**: `compute:inference` キーで進捗 `%` を表示
- **初回ロード**: 「初回は少し時間がかかります」のメッセージ表示
- **エラーハンドリング**:
  - メモリ不足 → 縮小して再試行、最終的に「メモリ不足」メッセージ
  - ネットワークエラー → 「接続を確認」メッセージ
  - その他 → 汎用エラーメッセージ、2.5秒後にアップロード画面に戻る

### 機能3: 背景選択
- **4種類の宇宙背景**をサムネイルで表示し、タップ/クリックで切替
- **背景一覧**:
  | ID | 名前 | ファイル | 内容 |
  |----|------|---------|------|
  | galaxy | 銀河 | `bg/galaxy.webp` | 渦巻銀河（デフォルト） |
  | nebula | 星雲 | `bg/nebula.webp` | カラフルな星雲（オリオン等） |
  | deep-space | 深宇宙 | `bg/deep-space.webp` | 暗い星空・天の川 |
  | planet | 惑星 | `bg/planet.webp` | 惑星の近景 |
- **状態管理**: `currentBgId: string` で選択中の背景IDを保持
- **プリロード**: 全4枚を`loadBgImage()`で事前読み込み、`Map<string, HTMLImageElement>`に格納
- **UI配置**: コントロール領域の上部にサムネイル行を配置
- **サムネイルサイズ**: 幅64px、高さ自動、border-radius 8px
- **選択中の表示**: アクセントカラーのボーダー（2px solid #00d4ff）

### 機能4: 画像合成・編集
- **Canvas描画**: 選択中の背景画像の上に被写体を重ねる
- **被写体の状態管理**（正規化座標 0-1）:
  - 位置: `subjectX=0.5`, `subjectY=0.5`（初期値・中央）
  - スケール: `subjectScale=0.7`（範囲 0.05-3.0）
  - 回転: `subjectRotation=0`（範囲 -180〜180度）
  - 反転: `subjectFlipped=false`
- **操作方法**:
  - マウスドラッグ: 位置移動
  - タッチドラッグ: 位置移動
  - ピンチ: ズーム + 回転（2本指）
  - スライダー: サイズ / 回転の数値指定
  - ボタン: 反転 / リセット
- **背景切替時**: 即座に`scheduleRender()`で再描画（被写体の位置は維持）
- **レンダリング**: `requestAnimationFrame` でスロットリング（`scheduleRender()`）
- **ドラッグガイド**: 処理完了後に3秒表示、操作開始で即非表示

### 機能5: 出力・シェア
- **保存（💾）**:
  - モバイル → Web Share API（`navigator.share` + File）
  - デスクトップ → `<a download>` によるPNGダウンロード
- **シェア**:
  - モバイル → Web Share API（テキスト「🌌 #SpaceCat」付き）
  - デスクトップ → クリップボードにPNG画像コピー、失敗時はダウンロード
- **Xポスト**: `x.com/intent/post` URLで別タブを開く
- **ハッシュタグコピー**: `#SpaceCat` をタップでクリップボードにコピー
- **トースト通知**: コピー/ダウンロード時にフィードバック表示

### 機能6: UI/UX
- **ダークテーマ**: 背景 `#1a1a2e`、テキスト `#fff`
- **アクセントカラー**: パープル `#9b59b6` → シアン `#00d4ff` グラデーション（宇宙テーマ）
- **モバイルファースト**: `max-width: 480px`、`safe-area-inset` 対応
- **デバイス判定**: `ontouchstart` / `maxTouchPoints` でタッチ判定
- **ヒントテキスト**: タッチ → 「スライドで位置調整・ピンチでサイズ変更」、マウス → 「ドラッグで動物の位置を調整」
- **OGP/Twitterカード**: `og:image` と `twitter:image` にサンプル画像を設定

## 開発コマンド

```bash
pnpm install    # 依存関係インストール
pnpm dev        # 開発サーバー起動
pnpm build      # tsc && vite build
pnpm preview    # ビルドプレビュー
```

## 設定ファイル

| ファイル | 説明 |
|----------|------|
| CLAUDE.md | Claude Codeへのルール・設定 |
| README.md | 使い方ガイド |
| .claude/rules/*.md | 詳細ルール |
| .claude/references/*.md | 技術仕様・ガイドライン |

## 元ネタ

- アーキテクチャ参考: [@nya3_neko2](https://x.com/nya3_neko2) の [InspirationCat](https://github.com/nyanko3141592/InspirationCat)
- テーマ: 「宇宙猫」インターネットミーム（動物を宇宙空間に浮かべるクラシックミーム）
- 本プロジェクト: GitHub Pages で0円運用
