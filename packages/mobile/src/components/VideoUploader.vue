<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { validateVideoFile, formatFileSize } from '@/utils/validators'
import { uploadFile } from '@/api/upload'

interface Props {
  modelValue?: string
  thumbnail?: string
  maxSize?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 100,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [url: string]
  'update:thumbnail': [url: string]
  progress: [percent: number]
  error: [message: string]
}>()

const uploading = ref(false)
const uploadProgress = ref(0)
const localVideoUrl = ref('')
const localThumbnail = ref('')

const videoUrl = computed(() => props.modelValue || localVideoUrl.value)
const thumbnailUrl = computed(() => props.thumbnail || localThumbnail.value)

// 选择视频文件
async function handleSelectVideo() {
  if (props.disabled || uploading.value) return
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/mp4,video/avi,video/quicktime,video/x-msvideo'
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    // 验证文件
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      showToast(validation.message || '文件验证失败')
      emit('error', validation.message || '文件验证失败')
      return
    }
    
    await uploadVideo(file)
  }
  
  input.click()
}

// 上传视频
async function uploadVideo(file: File) {
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // 生成本地预览
    localVideoUrl.value = URL.createObjectURL(file)
    
    // 生成缩略图
    const thumbnail = await generateThumbnail(file)
    localThumbnail.value = thumbnail
    
    // 上传文件
    const result = await uploadFile(file, {
      onProgress: (percent: number) => {
        uploadProgress.value = Math.min(Math.max(percent, 0), 100)
        emit('progress', uploadProgress.value)
      }
    })
    
    emit('update:modelValue', result.url)
    emit('update:thumbnail', thumbnail)
    showToast('视频上传成功')
  } catch (error: any) {
    showToast(error.message || '视频上传失败')
    emit('error', error.message || '视频上传失败')
    // 清除本地预览
    localVideoUrl.value = ''
    localThumbnail.value = ''
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 生成视频缩略图
function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    
    video.onloadeddata = () => {
      video.currentTime = 1 // 取第1秒的画面
    }
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      URL.revokeObjectURL(video.src)
      resolve(dataUrl)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve('')
    }
  })
}

// 删除视频
function handleDelete() {
  localVideoUrl.value = ''
  localThumbnail.value = ''
  emit('update:modelValue', '')
  emit('update:thumbnail', '')
}

// 播放视频
const showPlayer = ref(false)
function handlePlay() {
  if (videoUrl.value) {
    showPlayer.value = true
  }
}
</script>

<template>
  <div class="video-uploader">
    <!-- 已有视频 -->
    <div v-if="videoUrl && !uploading" class="video-preview" @click="handlePlay">
      <img v-if="thumbnailUrl" :src="thumbnailUrl" alt="视频缩略图" class="thumbnail" />
      <div v-else class="thumbnail-placeholder">
        <van-icon name="video-o" size="48" />
      </div>
      <div class="play-overlay">
        <van-icon name="play-circle-o" size="48" color="#fff" />
      </div>
      <van-icon 
        name="cross" 
        class="delete-btn" 
        @click.stop="handleDelete"
      />
    </div>
    
    <!-- 上传中 -->
    <div v-else-if="uploading" class="upload-progress">
      <van-circle
        :current-rate="uploadProgress"
        :rate="100"
        :speed="100"
        :text="`${uploadProgress}%`"
        size="80px"
      />
      <p class="progress-text">视频上传中...</p>
    </div>
    
    <!-- 上传按钮 -->
    <div v-else class="upload-trigger" @click="handleSelectVideo">
      <van-icon name="video-o" size="32" color="#999" />
      <p class="upload-hint">点击上传视频</p>
      <p class="upload-desc">支持 MP4、AVI、MOV，最大100MB</p>
    </div>
    
    <!-- 视频播放器弹窗 -->
    <van-popup v-model:show="showPlayer" position="center" :style="{ width: '90%', maxWidth: '500px' }">
      <div class="video-player-wrapper">
        <video 
          v-if="showPlayer && videoUrl"
          :src="videoUrl" 
          controls 
          autoplay
          class="video-player"
        />
        <van-icon 
          name="cross" 
          class="close-btn" 
          @click="showPlayer = false"
        />
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.video-uploader {
  width: 100%;
}

.video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.upload-progress {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.progress-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.upload-trigger {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.upload-trigger:active {
  background: #eee;
}

.upload-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.upload-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.video-player-wrapper {
  position: relative;
  background: #000;
}

.video-player {
  width: 100%;
  max-height: 70vh;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}
</style>
