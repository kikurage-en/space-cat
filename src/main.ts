import './style.css'

// --- DOM要素 ---
const uploadSection = document.getElementById('upload-section')!
const processingSection = document.getElementById('processing-section')!
const resultSection = document.getElementById('result-section')!
const uploadArea = document.getElementById('upload-area')!
const fileInput = document.getElementById('file-input') as HTMLInputElement
const processingStatus = document.getElementById('processing-status')!
const canvas = document.getElementById('result-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const dragGuide = document.getElementById('drag-guide')!
const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement
const rotationSlider = document.getElementById('rotation-slider') as HTMLInputElement
const flipBtn = document.getElementById('flip-btn')!
const saveBtn = document.getElementById('save-btn')!
const shareBtn = document.getElementById('share-btn')!
const tweetBtn = document.getElementById('tweet-btn')!
const hashtagEl = document.getElementById('hashtag')!
const resetBtn = document.getElementById('reset-btn')!
const toast = document.getElementById('toast')!

// --- 状態変数 ---
let subjectImg: HTMLImageElement | null = null
let subjectX = 0.5
let subjectY = 0.7
let subjectScale = 0.7
let subjectRotation = 0
let subjectFlipped = false
let currentBgId = 'galaxy'
const bgImages = new Map<string, HTMLImageElement>()

// --- セクション表示切替 ---
function showSection(section: 'upload' | 'processing' | 'result') {
  uploadSection.classList.toggle('hidden', section !== 'upload')
  processingSection.classList.toggle('hidden', section !== 'processing')
  resultSection.classList.toggle('hidden', section !== 'result')
}

// --- ファイル処理 ---
function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      processImage(img)
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

// --- 画像処理（Phase 3で実装） ---
function processImage(_img: HTMLImageElement) {
  console.log('processImage called:', _img.width, 'x', _img.height)
  showSection('processing')
  processingStatus.textContent = '背景を除去中...'
}

// --- イベントリスナー ---

// アップロードエリアクリック
uploadArea.addEventListener('click', () => {
  fileInput.click()
})

// ファイル選択
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (file) handleFile(file)
})

// ドラッグ&ドロップ
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.classList.add('dragover')
})

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover')
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.classList.remove('dragover')
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
})

// --- 未使用変数の一時的な参照（Phase後半で使用） ---
void ctx
void dragGuide
void scaleSlider
void rotationSlider
void flipBtn
void saveBtn
void shareBtn
void tweetBtn
void hashtagEl
void resetBtn
void toast
void subjectImg
void subjectX
void subjectY
void subjectScale
void subjectRotation
void subjectFlipped
void currentBgId
void bgImages
