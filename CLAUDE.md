# space-cat

動物写真の背景を除去し、銀河・星雲の宇宙背景と合成して「宇宙猫」ミーム画像を生成するブラウザ完結型Webアプリ。

## 基本ルール
- 日本語で回答、コミットメッセージも日本語
- 変更前にユーザー確認を取る
- パッケージマネージャは **pnpm** を使用（npm/yarn不可）

## アーキテクチャ（変更禁止）
- **バックエンドなし**: 全処理をブラウザで完結
- **画像はサーバーに送信しない**: プライバシー保護の根幹
- **React不使用**: Vite + TypeScript のみ（src/main.ts に全ロジック）
- **単一エントリポイント**: src/main.ts が全機能を担当

## 技術スタック
| 要素 | 技術 | バージョン |
|------|------|-----------|
| ビルド | Vite | ^8.0.4 |
| 言語 | TypeScript | ~6.0.2 (target: es2023) |
| 背景除去 | @imgly/background-removal | ^1.7.0 |
| 画像合成 | Canvas API | ブラウザ標準 |
| ホスティング | GitHub Pages | - |

## ライセンス
**AGPL-3.0-only**（@imgly/background-removal がAGPLのため、ソースコード公開が必要）

## 開発コマンド
```bash
pnpm dev        # 開発サーバー
pnpm build      # tsc && vite build
pnpm preview    # ビルドプレビュー
```

## 主要な実装パターン

### 画像処理フロー
1. アップロード → リサイズ（1024→768→512px メモリフォールバック）
2. `removeBackground()` でAI背景除去
3. 4種類の宇宙背景（galaxy/nebula/deep-space/planet）からUI選択
4. Canvas上で選択背景 + 被写体を合成
5. PNG出力（Web Share API / ダウンロード / クリップボード）

### 背景管理
4枚をプリロードし `Map<string, HTMLImageElement>` で保持。`currentBgId` で選択中を管理。

### 被写体の状態管理
正規化座標(0-1)で管理: `subjectX`, `subjectY`, `subjectScale`, `subjectRotation`, `subjectFlipped`

### レンダリング
`requestAnimationFrame` でスロットリング（`scheduleRender()`）

### デバイス対応
`ontouchstart` / `maxTouchPoints` でタッチ判定、Web Share API でモバイル対応

## デザインシステム
- ダークテーマ: 背景 `#0a0a1a`（深い宇宙）、テキスト `#fff`
- アクセント: `#9b59b6`（パープル） → `#00d4ff`（シアン） グラデーション
- モバイルファースト: `max-width: 480px`、`safe-area-inset` 対応
- ハッシュタグ: `#SpaceCat`

## デプロイ
- GitHub Actions で main ブランチ push 時に自動デプロイ
- `vite.config.ts` の `base` をリポジトリ名に設定

## セキュリティ
- MUST NOT: .env, APIキー, credentials をコミットする
- MUST NOT: ユーザー画像をサーバーに送信する処理を追加する
- MUST: 外部URLへのアクセスにはWebFetchを使用する
- 詳細: @.claude/rules/security-guidelines.md

## ルール（詳細）
@.claude/rules/development-workflow.md
@.claude/rules/security-guidelines.md

## 参照ドキュメント
@.claude/references/environment-spec.md
@.claude/references/style-guide.md
@.claude/references/verification-guidelines.md
