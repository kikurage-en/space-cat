import { removeBackground } from '@imgly/background-removal'
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

// --- リサイズ ---
function resizeImage(img: HTMLImageElement, maxSize: number): Blob {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const offCtx = offscreen.getContext('2d')!
  offCtx.drawImage(img, 0, 0, w, h)

  let blob: Blob | null = null
  offscreen.toBlob((b) => { blob = b }, 'image/png')
  // toBlob is async — use synchronous toDataURL fallback
  const dataUrl = offscreen.toDataURL('image/png')
  const bin = atob(dataUrl.split(',')[1])
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  blob = new Blob([arr], { type: 'image/png' })
  return blob
}

// --- 背景除去 ---
const SIZES = [1024, 768, 512]

async function processImage(img: HTMLImageElement) {
  showSection('processing')
  processingStatus.textContent = '背景を除去中...'

  for (const size of SIZES) {
    try {
      const blob = resizeImage(img, size)
      const resultBlob = await removeBackground(blob, {
        progress(key, current, total) {
          if (key === 'compute:inference') {
            const pct = Math.round((current / total) * 100)
            processingStatus.textContent = `処理中... ${pct}%`
          }
        },
      })

      // Blob→Image変換
      const url = URL.createObjectURL(resultBlob)
      const subject = new Image()
      await new Promise<void>((resolve, reject) => {
        subject.onload = () => resolve()
        subject.onerror = reject
        subject.src = url
      })
      URL.revokeObjectURL(url)

      subjectImg = subject
      resetSubjectState()
      showSection('result')
      scheduleRender()
      showDragGuide()
      return
    } catch (e) {
      console.warn(`Size ${size}px failed:`, e)
      if (size === SIZES[SIZES.length - 1]) {
        handleProcessingError(e)
      }
    }
  }
}

function resetSubjectState() {
  subjectX = 0.5
  subjectY = 0.7
  subjectScale = 0.7
  subjectRotation = 0
  subjectFlipped = false
  scaleSlider.value = '0.7'
  rotationSlider.value = '0'
}

function handleProcessingError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.toLowerCase().includes('memory') || msg.toLowerCase().includes('oom')) {
    processingStatus.textContent = 'メモリ不足です。より小さい画像をお試しください。'
  } else {
    processingStatus.textContent = `エラーが発生しました: ${msg}`
  }
}

// --- 背景画像プリロード ---
const BG_IDS = ['galaxy', 'nebula', 'deep-space', 'planet']

function loadBgImage(id: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = `${import.meta.env.BASE_URL}bg/${id}.webp`
  })
}

async function preloadBackgrounds() {
  const entries = await Promise.all(
    BG_IDS.map(async (id) => {
      const img = await loadBgImage(id)
      return [id, img] as const
    })
  )
  for (const [id, img] of entries) {
    bgImages.set(id, img)
  }
}

preloadBackgrounds()

// --- Canvas描画 ---
let renderPending = false

function scheduleRender() {
  if (renderPending) return
  renderPending = true
  requestAnimationFrame(() => {
    renderPending = false
    renderResult()
  })
}

function renderResult() {
  if (!subjectImg) return

  const bgImg = bgImages.get(currentBgId)

  // 背景描画
  if (bgImg) {
    const bgScale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height)
    const bw = bgImg.width * bgScale
    const bh = bgImg.height * bgScale
    ctx.drawImage(bgImg, (canvas.width - bw) / 2, (canvas.height - bh) / 2, bw, bh)
  } else {
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // 被写体描画
  const fitScale = Math.min(canvas.width / subjectImg.width, canvas.height / subjectImg.height)
  const drawScale = fitScale * subjectScale
  const dw = subjectImg.width * drawScale
  const dh = subjectImg.height * drawScale
  const cx = subjectX * canvas.width
  const cy = subjectY * canvas.height

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((subjectRotation * Math.PI) / 180)
  if (subjectFlipped) ctx.scale(-1, 1)
  ctx.drawImage(subjectImg, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

// --- ドラッグガイド ---
function showDragGuide() {
  dragGuide.classList.remove('hidden', 'fade-out')
  setTimeout(() => {
    dragGuide.classList.add('fade-out')
    setTimeout(() => dragGuide.classList.add('hidden'), 600)
  }, 3000)
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

// 背景選択
const bgThumbs = document.querySelectorAll<HTMLImageElement>('.bg-thumb')
bgThumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const id = thumb.dataset.bg
    if (!id) return
    currentBgId = id
    bgThumbs.forEach((t) => t.classList.toggle('active', t === thumb))
    scheduleRender()
  })
})

// --- マウスドラッグ ---
let dragging = false

function hideDragGuide() {
  dragGuide.classList.add('fade-out')
  setTimeout(() => dragGuide.classList.add('hidden'), 600)
}

function canvasToNormalized(clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  }
}

canvas.addEventListener('mousedown', (e) => {
  dragging = true
  const pos = canvasToNormalized(e.clientX, e.clientY)
  subjectX = pos.x
  subjectY = pos.y
  hideDragGuide()
  scheduleRender()
})

window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const pos = canvasToNormalized(e.clientX, e.clientY)
  subjectX = pos.x
  subjectY = pos.y
  scheduleRender()
})

window.addEventListener('mouseup', () => {
  dragging = false
})

// --- タッチドラッグ + ピンチ ---
let lastTouchDist = 0
let lastTouchAngle = 0

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  hideDragGuide()
  if (e.touches.length === 1) {
    dragging = true
    const pos = canvasToNormalized(e.touches[0].clientX, e.touches[0].clientY)
    subjectX = pos.x
    subjectY = pos.y
    scheduleRender()
  } else if (e.touches.length === 2) {
    dragging = false
    const dx = e.touches[1].clientX - e.touches[0].clientX
    const dy = e.touches[1].clientY - e.touches[0].clientY
    lastTouchDist = Math.hypot(dx, dy)
    lastTouchAngle = Math.atan2(dy, dx)
  }
}, { passive: false })

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  if (e.touches.length === 1 && dragging) {
    const pos = canvasToNormalized(e.touches[0].clientX, e.touches[0].clientY)
    subjectX = pos.x
    subjectY = pos.y
    scheduleRender()
  } else if (e.touches.length === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX
    const dy = e.touches[1].clientY - e.touches[0].clientY
    const dist = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)

    if (lastTouchDist > 0) {
      subjectScale *= dist / lastTouchDist
      subjectScale = Math.max(0.05, Math.min(3, subjectScale))
      scaleSlider.value = String(subjectScale)
    }
    if (lastTouchAngle !== 0) {
      const delta = ((angle - lastTouchAngle) * 180) / Math.PI
      subjectRotation += delta
      subjectRotation = ((subjectRotation + 180) % 360 + 360) % 360 - 180
      rotationSlider.value = String(Math.round(subjectRotation))
    }

    lastTouchDist = dist
    lastTouchAngle = angle
    scheduleRender()
  }
}, { passive: false })

canvas.addEventListener('touchend', (e) => {
  e.preventDefault()
  if (e.touches.length < 2) {
    lastTouchDist = 0
    lastTouchAngle = 0
  }
  if (e.touches.length === 0) {
    dragging = false
  }
}, { passive: false })

// --- スライダー ---
scaleSlider.addEventListener('input', () => {
  subjectScale = parseFloat(scaleSlider.value)
  scheduleRender()
})

rotationSlider.addEventListener('input', () => {
  subjectRotation = parseFloat(rotationSlider.value)
  scheduleRender()
})

// --- 反転 ---
flipBtn.addEventListener('click', () => {
  subjectFlipped = !subjectFlipped
  scheduleRender()
})

// --- 未使用変数の一時的な参照（Phase 6で使用） ---
void saveBtn
void shareBtn
void tweetBtn
void hashtagEl
void resetBtn
void toast
