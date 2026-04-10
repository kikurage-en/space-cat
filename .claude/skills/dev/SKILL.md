---
name: dev
description: |
  space-cat の開発を支援する。
  動物写真の背景を宇宙に差し替えるブラウザ完結型Webアプリの構築・改善・デプロイをサポート。

  [起動条件] /dev、「開発を始める」「実装を進める」「ビルドして」等
---

# space-cat - メインスキル

動物写真の背景を除去し、銀河・星雲の宇宙背景と合成して「宇宙猫」ミーム画像を生成するブラウザ完結型Webアプリ。

## 共通設定への参照

プロジェクトの基本設定・技術仕様・ルールは以下を参照:
- @CLAUDE.md — 基本ルール、アーキテクチャ、実装パターン、開発コマンド
- @.claude/references/environment-spec.md — 技術スタック詳細、依存関係、静的ファイル一覧
- @.claude/references/style-guide.md — デザインシステム、CSS/TS規約、コミット規約
- @.claude/references/verification-guidelines.md — 検証基準・手順
- @.claude/rules/security-guidelines.md — セキュリティルール
- @.claude/rules/development-workflow.md — 開発ワークフロー・チェックリスト

## アーキテクチャ概要

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

## 主要機能の実装仕様

> 状態管理の初期値・カラー値等の具体値は実装コード（`src/main.ts`, `src/style.css`）を直接確認すること。
> デザインの詳細は @.claude/references/style-guide.md を参照。

### 機能1: 画像アップロード
- **タップ/クリック**: `<input type="file" accept="image/*">` をトリガー
- **ドラッグ&ドロップ**: `dragover`/`drop` イベント、`image/*` のみ受け付け

### 機能2: 背景除去（ブラウザ内AI推論）
- `@imgly/background-removal` の `removeBackground()` を使用
- メモリ対策: 処理前に画像をリサイズ（1024→768→512px の3段階フォールバック）
- プログレス表示: `compute:inference` キーで進捗 `%` を表示
- エラーハンドリング:
  - メモリ不足 → 縮小して再試行、最終的に「メモリ不足」メッセージ
  - ネットワークエラー → 「接続を確認」メッセージ
  - その他 → 汎用エラーメッセージ、2.5秒後にアップロード画面に戻る

### 機能3: 背景選択
- 4種類の宇宙背景（galaxy/nebula/deep-space/planet）をサムネイルで表示し切替
- `currentBgId` で選択中の背景IDを保持
- 全4枚を `loadBgImage()` で事前読み込み、`Map<string, HTMLImageElement>` に格納
- 背景ファイル一覧は @.claude/references/environment-spec.md を参照

### 機能4: 画像合成・編集
- Canvas上で選択背景 + 被写体を重ねて描画
- 被写体の状態は正規化座標(0-1)で管理（初期値は `src/main.ts` を参照）
- 操作: マウスドラッグ / タッチドラッグ / ピンチ（ズーム+回転） / スライダー / 反転ボタン
- `requestAnimationFrame` でスロットリング（`scheduleRender()`）
- ドラッグガイド: 処理完了後に3秒表示、操作開始で即非表示

### 機能5: 出力・シェア
- **保存**: モバイル → Web Share API、デスクトップ → PNGダウンロード
- **シェア**: モバイル → Web Share API（テキスト付き）、デスクトップ → クリップボードコピー
- **Xポスト**: `x.com/intent/post` URLで別タブ
- **ハッシュタグコピー**: `#SpaceCat` をタップでクリップボードにコピー

## 元ネタ

- アーキテクチャ参考: [@nya3_neko2](https://x.com/nya3_neko2) の [InspirationCat](https://github.com/nyanko3141592/InspirationCat)
