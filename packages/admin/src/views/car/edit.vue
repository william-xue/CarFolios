<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CarForm, GearboxType, EmissionStandard, UseType } from '@/types'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const carStore = useCarStore()

const carId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEdit = computed(() => !!carId.value)
const pageTitle = computed(() => isEdit.value ? '编辑车源' : '发布车源')

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive<CarForm>({
  brandId: null,
  seriesId: null,
  modelId: null,
  firstRegDate: '',
  mileage: null,
  displacement: null,
  gearbox: null,
  emissionStandard: null,
  useType: null,
  transferCount: 0,
  cityCode: '',
  address: '',
  price: null,
  originalPrice: null,
  images: [],
  video: '',
  highlightDesc: '',
  inspectionReport: '',
  color: '',
  plateCity: '',
  annualInspection: '',
  insurance: '',
  configs: [],
})

const rules: FormRules = {
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  seriesId: [{ required: true, message: '请选择车系', trigger: 'change' }],
  modelId: [{ required: true, message: '请选择车型', trigger: 'change' }],
  firstRegDate: [{ required: true, message: '请选择上牌时间', trigger: 'change' }],
  mileage: [{ required: true, message: '请输入行驶里程', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  cityCode: [{ required: true, message: '请选择所在城市', trigger: 'change' }],
  images: [{ required: true, message: '请上传车辆图片', trigger: 'change' }],
  highlightDesc: [{ required: true, message: '请输入车辆亮点', trigger: 'blur' }],
}

const gearboxOptions: { label: string; value: GearboxType }[] = [
  { label: '手动', value: 'MT' },
  { label: '自动', value: 'AT' },
  { label: '双离合', value: 'DCT' },
  { label: 'CVT', value: 'CVT' },
]

const emissionOptions: { label: string; value: EmissionStandard }[] = [
  { label: '国三', value: '国三' },
  { label: '国四', value: '国四' },
  { label: '国五', value: '国五' },
  { label: '国六', value: '国六' },
]

const useTypeOptions: { label: string; value: UseType }[] = [
  { label: '家用', value: 'family' },
  { label: '商务', value: 'business' },
  { label: '公务', value: 'official' },
]

const configOptions = [
  '全景天窗', '真皮座椅', '座椅加热', '座椅通风', '电动座椅',
  '倒车影像', '360全景影像', '自动泊车', '定速巡航', '自适应巡航',
  '车道保持', '主动刹车', '并线辅助', '导航系统', 'CarPlay',
  '蓝牙电话', '无钥匙进入', '一键启动', '电动尾门', '空气悬挂',
]

// 示例图片（实际项目中应该上传到服务器）
const sampleImages = [
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
]

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      carStore.fetchBrands(),
      carStore.fetchCities(),
    ])

    if (isEdit.value && carId.value) {
      const car = await carStore.fetchCarDetail(carId.value)
      if (car) {
        // 填充表单
        Object.assign(form, {
          brandId: car.brandId,
          seriesId: car.seriesId,
          modelId: car.modelId,
          firstRegDate: car.firstRegDate,
          mileage: car.mileage,
          displacement: car.displacement,
          gearbox: car.gearbox,
          emissionStandard: car.emissionStandard,
          useType: car.useType,
          transferCount: car.transferCount,
          cityCode: car.cityCode,
          address: car.address,
          price: car.price,
          originalPrice: car.originalPrice,
          images: car.images,
          video: car.video,
          highlightDesc: car.highlightDesc,
          inspectionReport: car.inspectionReport,
          color: car.color,
          plateCity: car.plateCity,
          annualInspection: car.annualInspection,
          insurance: car.insurance,
          configs: car.configs,
        })
        // 加载车系和车型
        if (car.brandId) await carStore.fetchSeries(car.brandId)
        if (car.seriesId) await carStore.fetchModels(car.seriesId)
      }
    }
  } finally {
    loading.value = false
  }
})

// 品牌变化时加载车系
watch(() => form.brandId, async (brandId) => {
  form.seriesId = null
  form.modelId = null
  carStore.series = []
  carStore.models = []
  if (brandId) {
    await carStore.fetchSeries(brandId)
  }
})

// 车系变化时加载车型
watch(() => form.seriesId, async (seriesId) => {
  form.modelId = null
  carStore.models = []
  if (seriesId) {
    await carStore.fetchModels(seriesId)
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value && carId.value) {
      await carStore.updateCar(carId.value, form)
      ElMessage.success('更新成功')
    } else {
      await carStore.createCar(form)
      ElMessage.success('发布成功')
    }
    router.push('/cars')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

function handleCancel() {
  router.back()
}

function addSampleImage() {
  const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
  if (!form.images.includes(randomImage)) {
    form.images.push(randomImage)
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}
</script>

<template>
  <div class="car-edit" v-loading="loading">
    <el-card>
      <template #header>
        <span>{{ pageTitle }}</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="form.brandId" placeholder="请选择品牌" filterable style="width: 100%">
            <el-option
              v-for="brand in carStore.brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="车系" prop="seriesId">
          <el-select
            v-model="form.seriesId"
            placeholder="请先选择品牌"
            :disabled="!form.brandId"
            style="width: 100%"
          >
            <el-option
              v-for="s in carStore.series"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="车型" prop="modelId">
          <el-select
            v-model="form.modelId"
            placeholder="请先选择车系"
            :disabled="!form.seriesId"
            style="width: 100%"
          >
            <el-option
              v-for="m in carStore.models"
              :key="m.id"
              :label="`${m.name} ${m.year}款`"
              :value="m.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上牌时间" prop="firstRegDate">
          <el-date-picker
            v-model="form.firstRegDate"
            type="month"
            placeholder="选择上牌时间"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 车况信息 -->
        <el-divider content-position="left">车况信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行驶里程" prop="mileage">
              <el-input-number
                v-model="form.mileage"
                :min="0"
                :max="100"
                :precision="1"
                placeholder="万公里"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排量">
              <el-input-number
                v-model="form.displacement"
                :min="0"
                :max="10"
                :precision="1"
                placeholder="L"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="变速箱">
              <el-select v-model="form.gearbox" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="opt in gearboxOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排放标准">
              <el-select v-model="form.emissionStandard" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="opt in emissionOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆用途">
              <el-select v-model="form.useType" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="opt in useTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过户次数">
              <el-input-number
                v-model="form.transferCount"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车身颜色">
              <el-input v-model="form.color" placeholder="如：白色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车牌归属">
              <el-input v-model="form.plateCity" placeholder="如：京" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 价格信息 -->
        <el-divider content-position="left">价格信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :max="1000"
                :precision="2"
                placeholder="万元"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新车指导价">
              <el-input-number
                v-model="form.originalPrice"
                :min="0"
                :max="1000"
                :precision="2"
                placeholder="万元（选填）"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置信息 -->
        <el-divider content-position="left">位置信息</el-divider>

        <el-form-item label="所在城市" prop="cityCode">
          <el-select v-model="form.cityCode" placeholder="请选择城市" filterable style="width: 100%">
            <el-option
              v-for="city in carStore.cities"
              :key="city.code"
              :label="city.name"
              :value="city.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="详细地址">
          <el-input v-model="form.address" placeholder="如：朝阳区望京SOHO" />
        </el-form-item>

        <!-- 图片信息 -->
        <el-divider content-position="left">图片信息</el-divider>

        <el-form-item label="车辆图片" prop="images">
          <div class="image-list">
            <div
              v-for="(img, index) in form.images"
              :key="index"
              class="image-item"
            >
              <el-image :src="img" fit="cover" class="image-preview" />
              <div class="image-actions">
                <el-button type="danger" size="small" circle @click="removeImage(index)">
                  ×
                </el-button>
              </div>
            </div>
            <div class="image-upload" @click="addSampleImage">
              <el-icon :size="32"><Plus /></el-icon>
              <span>添加图片</span>
            </div>
          </div>
          <div class="image-tip">点击添加示例图片（实际项目中应上传真实图片）</div>
        </el-form-item>

        <!-- 描述信息 -->
        <el-divider content-position="left">描述信息</el-divider>

        <el-form-item label="车辆亮点" prop="highlightDesc">
          <el-input
            v-model="form.highlightDesc"
            type="textarea"
            :rows="4"
            placeholder="请描述车辆亮点，如：一手车主、全程4S店保养、无事故无泡水等"
          />
        </el-form-item>

        <el-form-item label="车辆配置">
          <el-checkbox-group v-model="form.configs">
            <el-checkbox v-for="config in configOptions" :key="config" :label="config">
              {{ config }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '立即发布' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.car-edit {
  max-width: 1000px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 120px;
  height: 90px;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
}

.image-upload {
  width: 120px;
  height: 90px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: border-color 0.3s;
}

.image-upload:hover {
  border-color: #409eff;
  color: #409eff;
}

.image-upload span {
  font-size: 12px;
  margin-top: 4px;
}

.image-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
