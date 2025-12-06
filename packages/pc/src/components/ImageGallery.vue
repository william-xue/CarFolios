<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps<{
    images: string[]
}>()

const currentIndex = ref(0)

const currentImage = computed(() => {
    return props.images[currentIndex.value] || ''
})

function selectImage(index: number) {
    currentIndex.value = index
}

function prevImage() {
    if (currentIndex.value > 0) {
        currentIndex.value--
    } else {
        currentIndex.value = props.images.length - 1
    }
}

function nextImage() {
    if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++
    } else {
        currentIndex.value = 0
    }
}

// 重置索引当图片列表变化时
watch(
    () => props.images,
    () => {
        currentIndex.value = 0
    }
)

// 预览相关
const previewVisible = ref(false)

function openPreview() {
    previewVisible.value = true
}
</script>

<template>
    <div class="image-gallery">
        <!-- 主图 -->
        <div 
            class="main-image-wrapper" 
            role="img"
            :aria-label="`车辆图片 ${currentIndex + 1}/${images.length}，点击查看大图`"
            tabindex="0"
            @click="openPreview"
            @keydown.enter="openPreview"
        >
            <el-image :src="currentImage" fit="contain" class="main-image" alt="车辆图片">
                <template #error>
                    <div class="image-placeholder" aria-hidden="true">
                        <el-icon size="48"><Picture /></el-icon>
                        <span>暂无图片</span>
                    </div>
                </template>
            </el-image>
            <!-- 左右切换按钮 -->
            <div v-if="images.length > 1" class="nav-buttons" role="group" aria-label="图片导航">
                <el-button circle :icon="ArrowLeft" class="nav-btn prev" aria-label="上一张图片" @click.stop="prevImage" />
                <el-button circle :icon="ArrowRight" class="nav-btn next" aria-label="下一张图片" @click.stop="nextImage" />
            </div>
            <!-- 图片计数 -->
            <div v-if="images.length > 1" class="image-counter">
                {{ currentIndex + 1 }} / {{ images.length }}
            </div>
        </div>

        <!-- 缩略图列表 -->
        <div v-if="images.length > 1" class="thumbnail-list" role="tablist" aria-label="图片缩略图">
            <div
                v-for="(image, index) in images"
                :key="index"
                :class="['thumbnail-item', { active: index === currentIndex }]"
                role="tab"
                :aria-selected="index === currentIndex"
                :aria-label="`查看第${index + 1}张图片`"
                tabindex="0"
                @click="selectImage(index)"
                @keydown.enter="selectImage(index)"
            >
                <el-image :src="image" fit="cover" class="thumbnail-image">
                    <template #error>
                        <div class="thumbnail-placeholder">
                            <el-icon><Picture /></el-icon>
                        </div>
                    </template>
                </el-image>
            </div>
        </div>

        <!-- 全屏预览 -->
        <el-image-viewer
            v-if="previewVisible"
            :url-list="images"
            :initial-index="currentIndex"
            @close="previewVisible = false"
        />
    </div>
</template>

<style lang="scss" scoped>
.image-gallery {
    width: 100%;
}

.main-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 75%; // 4:3 比例
    background: $bg-color;
    border-radius: $border-radius-md;
    overflow: hidden;
    cursor: zoom-in;
}

.main-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: $text-placeholder;
}

.nav-buttons {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
    pointer-events: none;

    .nav-btn {
        pointer-events: auto;
        opacity: 0.8;

        &:hover {
            opacity: 1;
        }
    }
}

.image-counter {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
}

.thumbnail-list {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 4px;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: $border-color;
        border-radius: 2px;
    }
}

.thumbnail-item {
    flex-shrink: 0;
    width: 80px;
    height: 60px;
    border-radius: $border-radius-sm;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;

    &:hover {
        border-color: $border-color;
    }

    &.active {
        border-color: $primary-color;
    }
}

.thumbnail-image {
    width: 100%;
    height: 100%;
}

.thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-color;
    color: $text-placeholder;
}
</style>
