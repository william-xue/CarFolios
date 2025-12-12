<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getFavorites, removeFavorite, type FavoriteItem } from '@/api/favorite'

const router = useRouter()

const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)
const finished = ref(false)

// 加载收藏列表
async function loadFavorites(isRefresh = false) {
  if (loading.value) return
  
  if (isRefresh) {
    page.value = 1
    finished.value = false
    refreshing.value = true
  }

  loading.value = true
  try {
    const result = await getFavorites({ page: page.value, pageSize })
    const list = result.list || []
    if (isRefresh) {
      favorites.value = list
    } else {
      favorites.value.push(...list)
    }
    total.value = result.total || 0
    
    if (favorites.value.length >= total.value) {
      finished.value = true
    }
  } catch (e: any) {
    showToast(e.message || '加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多
function loadMore() {
  if (finished.value || loading.value) return
  page.value++
  loadFavorites()
}

// 取消收藏
async function handleRemove(item: FavoriteItem) {
  try {
    await removeFavorite(item.carId)
    favorites.value = favorites.value.filter(f => f.id !== item.id)
    total.value--
    showToast('已取消收藏')
  } catch (e: any) {
    showToast(e.message || '操作失败')
  }
}

// 跳转详情
function goDetail(carId: number) {
  router.push(`/car/${carId}`)
}

// 返回
function goBack() {
  router.back()
}

// 格式化变速箱
function formatGearbox(type?: string) {
  const map: Record<string, string> = { MT: '手动', AT: '自动', DCT: '双离合', CVT: 'CVT' }
  return map[type || ''] || type
}

onMounted(() => {
  loadFavorites(true)
})
</script>

<template>
  <div class="favorites-page">
    <van-nav-bar title="我的收藏" left-arrow @click-left="goBack" />

    <van-pull-refresh v-model="refreshing" @refresh="loadFavorites(true)">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <van-empty v-if="!loading && favorites.length === 0" description="暂无收藏" />

        <div
          v-for="item in favorites"
          :key="item.id"
          class="favorite-item"
          @click="goDetail(item.carId)"
        >
          <van-image :src="item.car.coverImage || item.car.images?.[0]" fit="cover" class="car-image" />
          <div class="car-info">
            <div class="car-title">{{ item.car.title }}</div>
            <div class="car-tags">
              <van-tag>{{ item.car.firstRegDate }}上牌</van-tag>
              <van-tag>{{ item.car.mileage }}万公里</van-tag>
              <van-tag>{{ formatGearbox(item.car.gearbox) }}</van-tag>
            </div>
            <div class="car-bottom">
              <span class="price">{{ item.car.price }}<small>万</small></span>
              <van-button
                size="mini"
                plain
                type="danger"
                @click.stop="handleRemove(item)"
              >
                取消收藏
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.favorite-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 8px;
}

.car-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  flex-shrink: 0;
}

.car-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.car-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.car-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.car-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 600;
}

.price small {
  font-size: 12px;
}
</style>
