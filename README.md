# 🌌 SpaceCat

動物写真の背景を除去し、銀河・星雲の宇宙背景と合成して「宇宙猫」ミーム画像を生成するブラウザ完結型Webアプリ。

## 特徴

- バックエンドサーバーなし（全処理をブラウザで完結）
- ユーザー画像はサーバーに送信されない（プライバシー保護）
- GitHub Pagesで0円運用
- AIによる高精度な背景除去（ONNX Runtime Web）
- モバイル対応（タッチ操作、ピンチズーム、Web Share API）

## 技術スタック

| 要素 | 技術 | バージョン |
|------|------|-----------|
| ビルド | Vite | ^8.0.4 |
| 言語 | TypeScript | ~6.0.2 (target: es2023) |
| 背景除去 | @imgly/background-removal | ^1.7.0 |
| 画像合成 | Canvas API | ブラウザ標準 |
| ホスティング | GitHub Pages | - |

## セットアップ

```bash
git clone <repository-url>
cd space-cat
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` を開く。

## 使い方

1. ブラウザでアプリを開く
2. 動物の画像をタップ/クリック、またはドラッグ&ドロップで読み込む
3. AIが自動で背景を除去（初回はモデルダウンロードのため時間がかかる）
4. 宇宙空間に浮かぶ動物の画像が生成される
5. 位置・サイズ・回転を調整してベストな構図に
6. 💾 保存 / シェア / Xポスト（`#SpaceCat`）

## プロジェクト構成

```
space-cat/
├── public/
│   ├── bg.webp / bg.png           # 宇宙背景画像（銀河/星雲）
│   └── sample.webp / sample.png   # サンプル画像（OGP用）
├── src/
│   ├── main.ts                    # エントリポイント（全ロジック）
│   └── style.css                  # スタイルシート
├── index.html
├── package.json                   # AGPL-3.0-only
├── tsconfig.json                  # target: es2023
├── .github/workflows/             # GitHub Actionsデプロイ
├── .claude/
│   ├── skills/
│   │   ├── dev/SKILL.md           # /dev
│   │   └── improve/SKILL.md       # /improve
│   ├── rules/
│   │   ├── development-workflow.md
│   │   └── security-guidelines.md
│   ├── references/
│   │   ├── environment-spec.md
│   │   ├── style-guide.md
│   │   └── verification-guidelines.md
│   ├── hooks/detect-secrets.sh
│   └── settings.json
├── CLAUDE.md
├── README.md
└── .wizard-log.md
```

## デプロイ（GitHub Pages）

1. Settings > Pages > Source を「GitHub Actions」に設定
2. `vite.config.ts` に `base: '/space-cat/'` を設定
3. mainブランチへのpush時に自動デプロイ

## ライセンス

**AGPL-3.0-only** — @imgly/background-removal（AGPL-3.0）使用のため、ソースコード公開が必要。

## Claude Codeでの開発

| コマンド | 説明 |
|----------|------|
| `/dev` | 開発支援（実装・ビルド・デプロイ） |
| `/improve` | 設定ファイルの改善提案 |

## 元ネタ

アーキテクチャは [@nya3_neko2](https://x.com/nya3_neko2) の [InspirationCat](https://github.com/nyanko3141592/InspirationCat) を参考にしています。
テーマを「宇宙猫」ミームにアレンジ。
