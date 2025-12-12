<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getComments, addComment, deleteComment, type CommentItem } from '@/api/comment'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps<{
  carId: number
  ownerId?: number
}>()

const router = useRouter()
const userStore = useUserStore()

const comments = ref<CommentItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const commentText = ref('')
const replyTo = ref<CommentItem | null>(null)
const page = ref(1)
const pageSize = 10
const total = ref(0)
const finished = ref(false)

// 是否有更多评论
const hasMore = computed(() => comments.value.length < total.value)

// 格式化时间
function formatTime(date: string) {
  return dayjs(date).fromNow()
}

// 加载评论
async function loadComments(isRefresh = false) {
  if (loading.value) return
  
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  loading.value = true
  try {
    const result = await getComments(props.carId, { page: page.value, pageSize })
    const list = result.list || []
    if (isRefresh) {
      comments.value = list
    } else {
      comments.value.push(...list)
    }
    total.value = result.total || 0
    
    if (comments.value.length >= total.value) {
      finished.value = true
    }
  } catch (e: any) {
    showToast(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
function loadMore() {
  if (finished.value || loading.value) return
  page.value++
  loadComments()
}

// 提交评论
async function submitComment() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  const content = commentText.value.trim()
  if (!content) {
    showToast('请输入评论内容')
    return
  }

  if (content.length > 500) {
    showToast('评论内容不能超过500字')
    return
  }

  submitting.value = true
  try {
    const newComment = await addComment(props.carId, {
      content,
      parentId: replyTo.value?.id
    })
    
    // 添加到列表顶部
    comments.value.unshift(newComment)
    total.value++
    
    commentText.value = ''
    replyTo.value = null
    showToast('评论成功')
  } catch (e: any) {
    showToast(e.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

// 回复评论
function handleReply(comment: CommentItem) {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  replyTo.value = comment
}

// 取消回复
function cancelReply() {
  replyTo.value = null
}

// 删除评论
async function handleDelete(comment: CommentItem) {
  try {
    await showConfirmDialog({
      title: '删除评论',
      message: '确定要删除这条评论吗？'
    })
    
    await deleteComment(comment.id)
    comments.value = comments.value.filter(c => c.id !== comment.id)
    total.value--
    showToast('删除成功')
  } catch (e: any) {
    if (e !== 'cancel') {
      showToast(e.message || '删除失败')
    }
  }
}

// 是否可以删除（自己的评论或车主）
function canDelete(comment: CommentItem) {
  if (!userStore.isLoggedIn) return false
  return comment.userId === userStore.user?.id || userStore.user?.id === props.ownerId
}

onMounted(() => {
  loadComments(true)
})
</script>

<template>
  <div class="comment-section">
    <div class="section-header">
      <span class="title">评论 ({{ total }})</span>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-area">
      <div v-if="replyTo" class="reply-hint">
        <span>回复 @{{ replyTo.user.nickname }}</span>
        <van-icon name="cross" @click="cancelReply" />
      </div>
      <div class="input-row">
        <van-field
          v-model="commentText"
          :placeholder="replyTo ? `回复 @${replyTo.user.nickname}` : '写下你的评论...'"
          type="textarea"
          rows="1"
          autosize
          maxlength="500"
          show-word-limit
        />
        <van-button
          type="primary"
          size="small"
          :loading="submitting"
          :disabled="!commentText.trim()"
          @click="submitComment"
        >
          发送
        </van-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <van-empty v-if="!loading && comments.length === 0" description="暂无评论，快来抢沙发吧~" />
      
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <van-image
          :src="comment.user.avatar || '/default-avatar.png'"
          round
          width="36"
          height="36"
          class="avatar"
        />
        <div class="comment-content">
          <div class="comment-header">
            <span class="nickname">{{ comment.user.nickname }}</span>
            <span class="time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-text">{{ comment.content }}</div>
          <div class="comment-actions">
            <span class="action-btn" @click="handleReply(comment)">回复</span>
            <span v-if="canDelete(comment)" class="action-btn delete" @click="handleDelete(comment)">删除</span>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more" @click="loadMore">
        <van-loading v-if="loading" size="20" />
        <span v-else>加载更多</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  background: #fff;
  padding: 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header .title {
  font-size: 16px;
  font-weight: 600;
}

.comment-input-area {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.reply-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-row .van-field {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 8px 12px;
}

.input-row :deep(.van-field__control) {
  min-height: 24px;
}

.comment-list {
  min-height: 100px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.nickname {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 16px;
}

.action-btn {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.action-btn:active {
  color: #666;
}

.action-btn.delete {
  color: #ff4d4f;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
}
</style>
