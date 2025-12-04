<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  brand: '',
  model: '',
  year: '',
  mileage: '',
  price: '',
  description: '',
  images: [] as string[],
})

function checkLogin() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return false
  }
  return true
}

function handleSubmit() {
  if (!checkLogin()) return
  
  if (!form.value.brand || !form.value.model || !form.value.price) {
    showToast('请填写完整信息')
    return
  }
  
  showToast('发布成功，等待审核')
  router.push('/my-cars')
}
</script>

<template>
  <div class="publish-page">
    <van-nav-bar title="发布车源" />
    
    <van-form @submit="handleSubmit">
      <van-cell-group inset title="基本信息">
        <van-field
          v-model="form.brand"
          label="品牌"
          placeholder="请选择品牌"
          is-link
          readonly
          required
        />
        <van-field
          v-model="form.model"
          label="车型"
          placeholder="请选择车型"
          is-link
          readonly
          required
        />
        <van-field
          v-model="form.year"
          label="上牌年份"
          placeholder="请选择上牌年份"
          is-link
          readonly
          required
        />
      </van-cell-group>

      <van-cell-group inset title="车况信息">
        <van-field
          v-model="form.mileage"
          type="number"
          label="行驶里程"
          placeholder="请输入里程数"
          required
        >
          <template #button>万公里</template>
        </van-field>
        <van-field
          v-model="form.price"
          type="number"
          label="期望售价"
          placeholder="请输入售价"
          required
        >
          <template #button>万元</template>
        </van-field>
      </van-cell-group>

      <van-cell-group inset title="车辆描述">
        <van-field
          v-model="form.description"
          type="textarea"
          label="车辆亮点"
          placeholder="请描述车辆亮点，如保养记录、车况等"
          rows="3"
          autosize
        />
      </van-cell-group>

      <van-cell-group inset title="车辆图片">
        <van-cell>
          <van-uploader v-model="form.images" multiple :max-count="9" />
        </van-cell>
      </van-cell-group>

      <div class="submit-btn">
        <van-button type="primary" block native-type="submit">
          提交发布
        </van-button>
      </div>
    </van-form>

    <div class="publish-tips">
      <p>发布须知：</p>
      <ul>
        <li>请如实填写车辆信息</li>
        <li>上传清晰的车辆照片</li>
        <li>发布后需等待平台审核</li>
        <li>审核通过后将自动上架</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 100px;
}

.submit-btn {
  padding: 16px;
}

.publish-tips {
  padding: 0 16px;
  color: #999;
  font-size: 12px;
}

.publish-tips p {
  margin-bottom: 8px;
}

.publish-tips ul {
  padding-left: 16px;
}

.publish-tips li {
  margin-bottom: 4px;
}
</style>
