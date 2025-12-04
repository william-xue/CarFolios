<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mockGetDashboardStats } from '@/mock'
import type { DashboardStats } from '@/types'
import { Van, Document, User, ShoppingCart } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(true)
const stats = ref<DashboardStats>({
  totalCars: 0,
  onlineCars: 0,
  pendingCars: 0,
  totalOrders: 0,
  totalUsers: 0,
  todayNewCars: 0,
  todayNewOrders: 0,
})

onMounted(async () => {
  try {
    stats.value = await mockGetDashboardStats()
  } finally {
    loading.value = false
  }
})

function goToCars() {
  router.push('/cars')
}

function goToAudit() {
  router.push('/audit')
}

function goToCreateCar() {
  router.push('/cars/create')
}
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="goToCars">
          <div class="stat-content">
            <div class="stat-icon" style="background: #1890ff">
              <el-icon :size="28"><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCars }}</div>
              <div class="stat-label">车源总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>在线 {{ stats.onlineCars }} 辆</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="goToAudit">
          <div class="stat-content">
            <div class="stat-icon" style="background: #faad14">
              <el-icon :size="28"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingCars }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>今日新增 {{ stats.todayNewCars }} 辆</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #52c41a">
              <el-icon :size="28"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>今日新增 {{ stats.todayNewOrders }} 单</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #722ed1">
              <el-icon :size="28"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>活跃用户</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-button type="primary" size="large" class="action-btn" @click="goToCreateCar">
            <el-icon><Van /></el-icon>
            发布车源
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button size="large" class="action-btn" @click="goToAudit">
            <el-icon><Document /></el-icon>
            审核车源
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button size="large" class="action-btn" @click="goToCars">
            <el-icon><Van /></el-icon>
            管理车源
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 欢迎信息 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <h2>欢迎使用车故二手车管理后台</h2>
        <p>这是一个 MVP 演示版本，您可以：</p>
        <ul>
          <li>📝 发布和管理车源信息</li>
          <li>✅ 审核用户提交的车源</li>
          <li>📊 查看平台数据统计</li>
          <li>🔧 配置平台基础数据</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.stat-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.quick-actions {
  margin-bottom: 24px;
}

.action-btn {
  width: 100%;
  height: 60px;
  font-size: 16px;
}

.action-btn .el-icon {
  margin-right: 8px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.welcome-content h2 {
  margin: 0 0 16px;
  font-size: 24px;
}

.welcome-content p {
  margin: 0 0 12px;
  opacity: 0.9;
}

.welcome-content ul {
  margin: 0;
  padding-left: 20px;
}

.welcome-content li {
  margin-bottom: 8px;
  opacity: 0.9;
}
</style>
