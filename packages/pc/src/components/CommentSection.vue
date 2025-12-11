<script setup lang="ts">
import { addComment, deleteComment, getComments, type CommentItem } from '@/api/comment'
// import { useLocale } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'

/**
 * 评论区组件
 * Requirements: 5.1, 5.3, 5.6, 5.7, 5.8
 */

const props = defineProps<{
  carId: number
  ownerId: number // 车主ID，用于判断回复权限
}>()

const emit = defineEmits<{
  (e: 'login-required'): void
  (e: 'comment-added'): void
  (e: 'comment-deleted'): void
}>()

// const { t } = useLocale() // 预留国际化
const userStore = useUserStore()

// 评论列表
const comments = ref<CommentItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const hasMore = computed(() => comments.value.length < total.value)

// 评论输入
const commentContent = ref('')
const submitting = ref(false)

// 回复相关
const replyingTo = ref<CommentItem | null>(null)
const replyContent = ref('')
const replySubmitting = ref(false)

// 当前用户是否是车主
const isOwner = computed(() => userStore.user?.id === props.ownerId)

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}


// 获取评论列表
async function fetchComments(reset = false) {
  if (reset) {
    page.value = 1
    comments.value = []
  }
  
  loading.value = true
  try {
    const result = await getComments(props.carId, { page: page.value, pageSize })
    if (reset) {
      comments.value = result.list
    } else {
      comments.value.push(...result.list)
    }
    total.value = result.total
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多
async function loadMore() {
  if (loading.value || !hasMore.value) return
  page.value++
  await fetchComments()
}

// 提交评论 - Requirements: 5.1, 5.4
async function submitComment() {
  // 未登录检查 - Requirements: 5.2
  if (!userStore.isLoggedIn) {
    emit('login-required')
    return
  }
  
  // 空白内容验证 - Requirements: 5.4
  const content = commentContent.value.trim()
  if (!content) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  submitting.value = true
  try {
    const newComment = await addComment(props.carId, { content })
    // 添加到列表顶部（因为是新评论）
    comments.value.unshift(newComment)
    total.value++
    commentContent.value = ''
    ElMessage.success('评论成功')
    emit('comment-added')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

// 开始回复 - Requirements: 5.6
function startReply(comment: CommentItem) {
  if (!userStore.isLoggedIn) {
    emit('login-required')
    return
  }
  replyingTo.value = comment
  replyContent.value = ''
}

// 取消回复
function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

// 提交回复 - Requirements: 5.6
async function submitReply() {
  if (!replyingTo.value) return
  
  const content = replyContent.value.trim()
  if (!content) {
    ElMessage.warning('回复内容不能为空')
    return
  }
  
  replySubmitting.value = true
  try {
    const newReply = await addComment(props.carId, {
      content,
      parentId: replyingTo.value.id
    })
    
    // 添加到对应评论的回复列表
    const parentComment = comments.value.find(c => c.id === replyingTo.value?.id)
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = []
      }
      parentComment.replies.push(newReply)
    }
    
    cancelReply()
    ElMessage.success('回复成功')
    emit('comment-added')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '回复失败')
  } finally {
    replySubmitting.value = false
  }
}

// 删除评论 - Requirements: 5.8
async function handleDelete(comment: CommentItem, isReply = false, parentId?: number) {
  // 只能删除自己的评论
  if (comment.userId !== userStore.user?.id) {
    ElMessage.error('无权删除此评论')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(comment.id)
    
    if (isReply && parentId) {
      // 从父评论的回复列表中移除
      const parentComment = comments.value.find(c => c.id === parentId)
      if (parentComment?.replies) {
        parentComment.replies = parentComment.replies.filter(r => r.id !== comment.id)
      }
    } else {
      // 从评论列表中移除
      comments.value = comments.value.filter(c => c.id !== comment.id)
      total.value--
    }
    
    ElMessage.success('删除成功')
    emit('comment-deleted')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 判断是否可以删除评论
function canDelete(comment: CommentItem): boolean {
  return userStore.isLoggedIn && comment.userId === userStore.user?.id
}

// 判断是否可以回复（车主可以回复所有评论）
function canReply(comment: CommentItem): boolean {
  return userStore.isLoggedIn && isOwner.value
}

// 监听 carId 变化
watch(() => props.carId, () => {
  fetchComments(true)
})

onMounted(() => {
  fetchComments(true)
})
</script>


<template>
  <div class="comment-section">
    <!-- 评论输入框 -->
    <div class="comment-input-area">
      <div class="input-header">
        <h3 class="section-title">评论 ({{ total }})</h3>
      </div>
      <div class="input-box">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          :placeholder="userStore.isLoggedIn ? '写下你的评论...' : '请登录后发表评论'"
          :disabled="!userStore.isLoggedIn"
          maxlength="500"
          show-word-limit
        />
        <div class="input-actions">
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="!commentContent.trim()"
            @click="submitComment"
          >
            发表评论
          </el-button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-if="loading && comments.length === 0" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="comments.length === 0" class="empty-state">
        <el-empty description="暂无评论，快来发表第一条评论吧" />
      </div>
      
      <template v-else>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <!-- 评论主体 -->
          <div class="comment-main">
            <div class="comment-avatar">
              <el-avatar :size="40" :src="comment.user.avatar || undefined">
                {{ comment.user.nickname?.charAt(0) || '用' }}
              </el-avatar>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.user.nickname || '用户' }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-actions">
                <el-button
                  v-if="canReply(comment)"
                  type="primary"
                  link
                  size="small"
                  @click="startReply(comment)"
                >
                  回复
                </el-button>
                <el-button
                  v-if="canDelete(comment)"
                  type="danger"
                  link
                  size="small"
                  @click="handleDelete(comment)"
                >
                  删除
                </el-button>
              </div>
              
              <!-- 回复输入框 -->
              <div v-if="replyingTo?.id === comment.id" class="reply-input-box">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  :placeholder="`回复 ${comment.user.nickname || '用户'}...`"
                  maxlength="500"
                  show-word-limit
                />
                <div class="reply-actions">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button
                    type="primary"
                    size="small"
                    :loading="replySubmitting"
                    :disabled="!replyContent.trim()"
                    @click="submitReply"
                  >
                    回复
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 回复列表 -->
          <div v-if="comment.replies?.length" class="reply-list">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-avatar">
                <el-avatar :size="32" :src="reply.user.avatar || undefined">
                  {{ reply.user.nickname?.charAt(0) || '用' }}
                </el-avatar>
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.user.nickname || '用户' }}</span>
                  <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
                <div class="reply-item-actions">
                  <el-button
                    v-if="canDelete(reply)"
                    type="danger"
                    link
                    size="small"
                    @click="handleDelete(reply, true, comment.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <el-button :loading="loading" @click="loadMore">
            加载更多评论
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>


<style scoped>
.comment-section {
  padding: 20px 0;
}

.comment-input-area {
  margin-bottom: 24px;
}

.input-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.input-box {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comment-list {
  margin-top: 20px;
}

.loading-state,
.empty-state {
  padding: 40px 0;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
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
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.comment-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  word-break: break-word;
}

.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.reply-input-box {
  margin-top: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-list {
  margin-left: 52px;
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid var(--el-border-color-lighter);
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.reply-item:first-child {
  padding-top: 0;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-author {
  font-weight: 500;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.reply-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.reply-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  word-break: break-word;
}

.reply-item-actions {
  margin-top: 4px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}
</style>
