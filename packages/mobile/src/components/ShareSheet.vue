<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import PosterModal from './PosterModal.vue'

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
  title: string
  url: string
  description?: string
  image?: string
  car?: CarInfo
  contact?: {
    name: string
    phone: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const showPosterModal = ref(false)

const showSheet = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// 分享选项
const shareOptions = [
  [
    { name: '微信', icon: 'wechat' },
    { name: '朋友圈', icon: 'wechat-moments' },
    { name: '微博', icon: 'weibo' },
    { name: 'QQ', icon: 'qq' },
  ],
  [
    { name: '复制链接', icon: 'link' },
    { name: '生成海报', icon: 'poster' },
  ],
]

// 复制链接
async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    showToast('链接已复制')
    showSheet.value = false
  } catch {
    // 降级方案
    const input = document.createElement('input')
    input.value = props.url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    showToast('链接已复制')
    showSheet.value = false
  }
}

// 分享到微信
function shareToWechat() {
  // 移动端微信分享需要通过微信 JS-SDK
  // 这里提示用户手动分享
  showToast('请点击右上角分享到微信')
  showSheet.value = false
}

// 分享到微博
function shareToWeibo() {
  const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(props.url)}&title=${encodeURIComponent(props.title)}`
  window.open(shareUrl, '_blank')
  showSheet.value = false
}

// 分享到 QQ
function shareToQQ() {
  const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(props.url)}&title=${encodeURIComponent(props.title)}&desc=${encodeURIComponent(props.description || '')}`
  window.open(shareUrl, '_blank')
  showSheet.value = false
}

// 处理分享选项点击
function onSelect(option: { name: string; icon: string }) {
  switch (option.icon) {
    case 'wechat':
    case 'wechat-moments':
      shareToWechat()
      break
    case 'weibo':
      shareToWeibo()
      break
    case 'qq':
      shareToQQ()
      break
    case 'link':
      copyLink()
      break
    case 'poster':
      if (props.car) {
        showSheet.value = false
        showPosterModal.value = true
      } else {
        showToast('无法生成海报')
      }
      break
  }
}
</script>

<template>
  <van-share-sheet
    v-model:show="showSheet"
    title="分享给好友"
    :options="shareOptions"
    @select="onSelect"
  />
  
  <!-- 海报弹窗 -->
  <PosterModal
    v-if="car"
    v-model:show="showPosterModal"
    :car="car"
    :url="url"
    :contact="contact"
  />
</template>
