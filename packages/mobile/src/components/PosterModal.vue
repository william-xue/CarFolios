<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

interface CarInfo {
  title: string
  price: number
  image: string
  mileage?: number
  firstRegDate?: string
  gearbox?: string
  cityName?: string
}

const props = defineProps<{
  show: boolean
  car: CarInfo
  url: string
  contact?: {
    name: string
    phone: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const posterRef = ref<HTMLElement | null>(null)
const qrcodeRef = ref<HTMLCanvasElement | null>(null)
const posterImage = ref('')
const generating = ref(false)

// 格式化变速箱
function formatGearbox(type?: string) {
  const map: Record<string, string> = { MT: '手动', AT: '自动', DCT: '双离合', CVT: 'CVT' }
  return map[type || ''] || type || '自动'
}

// 生成二维码
async function generateQRCode() {
  if (!qrcodeRef.value) return
  try {
    await QRCode.toCanvas(qrcodeRef.value, props.url, {
      width: 80,
      margin: 1,
      color: { dark: '#333333', light: '#ffffff' }
    })
  } catch (e) {
    console.error('QRCode generation failed:', e)
  }
}

// 生成海报
async function generatePoster() {
  if (!posterRef.value || generating.value) return
  
  generating.value = true
  showLoadingToast({ message: '生成中...', forbidClick: true })
  
  try {
    // 先生成二维码
    await generateQRCode()
    await nextTick()
    
    // 等待图片加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const canvas = await html2canvas(posterRef.value, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    posterImage.value = canvas.toDataURL('image/png')
    closeToast()
  } catch (e) {
    closeToast()
    showToast('生成失败，请重试')
    console.error(e)
  } finally {
    generating.value = false
  }
}

// 保存海报（点击按钮）
function savePoster() {
  if (!posterImage.value) return
  
  const link = document.createElement('a')
  link.download = `车辆海报-${Date.now()}.png`
  link.href = posterImage.value
  link.click()
  showToast('海报已保存')
}

// 长按保存（移动端）
function handleLongPress() {
  if (!posterImage.value) return
  savePoster()
}

// 监听显示状态
watch(() => props.show, (val) => {
  if (val) {
    posterImage.value = ''
    nextTick(() => generatePoster())
  }
})
</script>

<template>
  <van-popup
    v-model:show="showModal"
    position="bottom"
    round
    :style="{ height: '85%' }"
    closeable
  >
    <div class="poster-modal">
      <div class="modal-header">
        <h3>生成海报</h3>
      </div>
      
      <div class="poster-container">
        <!-- 海报预览区域（长按可保存） -->
        <div 
          v-if="posterImage" 
          class="poster-preview"
          v-touch:longtap="handleLongPress"
        >
          <img :src="posterImage" alt="海报预览" />
          <div class="long-press-hint">长按图片可保存到相册</div>
        </div>
        
        <!-- 海报模板（用于生成） -->
        <div v-show="!posterImage" ref="posterRef" class="poster-template">
          <div class="poster-header">
            <div class="logo">🚗 爱车出海</div>
            <div class="slogan">优质二手车 · 放心购</div>
          </div>
          
          <div class="poster-image">
            <img :src="car.image" alt="车辆图片" crossorigin="anonymous" />
          </div>
          
          <div class="poster-info">
            <div class="car-title">{{ car.title }}</div>
            <div class="car-price">
              <span class="price-value">{{ car.price }}</span>
              <span class="price-unit">万</span>
            </div>
            <div class="car-tags">
              <span class="tag">{{ car.firstRegDate }}上牌</span>
              <span class="tag">{{ car.mileage }}万公里</span>
              <span class="tag">{{ formatGearbox(car.gearbox) }}</span>
            </div>
          </div>
          
          <div class="poster-contact">
            <div class="contact-info">
              <div class="contact-name">{{ contact?.name || '销售顾问' }}</div>
              <div class="contact-phone">{{ contact?.phone || '400-888-8888' }}</div>
            </div>
            <div class="qrcode-box">
              <canvas ref="qrcodeRef" class="qrcode-canvas"></canvas>
              <div class="qr-text">扫码查看</div>
            </div>
          </div>
          
          <div class="poster-footer">
            <div class="footer-text">长按保存图片 · 分享给好友</div>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <van-button 
          v-if="!posterImage" 
          type="primary" 
          block 
          :loading="generating"
          @click="generatePoster"
        >
          重新生成
        </van-button>
        <van-button 
          v-else 
          type="primary" 
          block 
          @click="savePoster"
        >
          保存海报
        </van-button>
      </div>
    </div>
  </van-popup>
</template>


<style scoped>
.poster-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.modal-header {
  text-align: center;
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.poster-container {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.poster-preview {
  max-width: 100%;
  text-align: center;
}

.poster-preview img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.long-press-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

.poster-template {
  width: 320px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  padding: 20px;
}

.poster-header {
  text-align: center;
  color: #fff;
  margin-bottom: 16px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.slogan {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.poster-image {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.poster-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.poster-info {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.car-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.car-price {
  margin-bottom: 12px;
}

.price-value {
  font-size: 28px;
  font-weight: bold;
  color: #ff4d4f;
}

.price-unit {
  font-size: 14px;
  color: #ff4d4f;
  margin-left: 2px;
}

.car-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.poster-contact {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.contact-phone {
  font-size: 16px;
  color: #667eea;
  font-weight: 500;
  margin-top: 4px;
}

.qrcode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-canvas {
  width: 80px !important;
  height: 80px !important;
  border-radius: 4px;
}

.qr-text {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.poster-footer {
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.modal-actions {
  padding-top: 16px;
}
</style>
