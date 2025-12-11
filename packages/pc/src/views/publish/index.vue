<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import LocationSelector from '@/components/LocationSelector.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import AddressInput from '@/components/AddressInput.vue'
import { validateVin, validatePrice, validateMileage } from '@/utils'
import { useLocale } from '@/composables/useLocale'
import type { ImageItem } from '@/types'
import { CAR_CONFIG_OPTIONS, USE_TYPE_OPTIONS, EMISSION_STANDARD_OPTIONS } from '@/types'

const { t } = useLocale()
const router = useRouter()
const carStore = useCarStore()

const DRAFT_KEY = 'car_publish_draft'

const formRef = ref<FormInstance>()
const currentStep = ref(0)
const submitting = ref(false)
const hasDraft = ref(false)

// 表单数据
const formData = reactive({
  // 基本信息
  brandId: null as number | null,
  seriesId: null as number | null,
  title: '',
  price: null as number | null,
  originalPrice: null as number | null,
  // 车况信息
  firstRegDate: '',
  mileage: null as number | null,
  gearbox: '',
  fuelType: '',
  displacement: null as number | null,
  color: '',
  vin: '',
  plateNumber: '',
  emissionStandard: '',
  useType: '',
  transferCount: 0,
  configs: [] as string[],
  // 地理位置
  location: [] as string[],
  address: '',
  // 图片和视频
  images: [] as ImageItem[],
  video: '',
  videoThumbnail: '',
  // 描述
  description: '',
  // 联系方式
  contactPhone: '',
  usePlatformPhone: false,
})

// 监听数据变化，自动保存草稿（防抖）
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

watch(
    formData,
    () => {
        if (autoSaveTimer) clearTimeout(autoSaveTimer)
        autoSaveTimer = setTimeout(() => {
            saveDraft()
        }, 1000)
    },
    { deep: true }
)

// 保存草稿
function saveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            step: currentStep.value,
            data: formData,
            timestamp: Date.now()
        }))
    } catch (e) {
        console.warn('草稿保存失败', e)
    }
}

// 恢复草稿
function restoreDraft() {
    try {
        const draftStr = localStorage.getItem(DRAFT_KEY)
        if (!draftStr) return

        const draft = JSON.parse(draftStr)
        // 简单的有效期检查（例如 7 天）
        if (Date.now() - draft.timestamp > 7 * 24 * 60 * 60 * 1000) {
            clearDraft()
            return
        }

        Object.assign(formData, draft.data)
        currentStep.value = draft.step || 0
        ElMessage.success('已恢复上次编辑内容')
        
        // 恢复后如果是第二步，需要重新加载车系数据
        if (formData.brandId) {
            carStore.fetchSeries(formData.brandId)
        }
    } catch (e) {
        console.warn('草稿恢复失败', e)
    }
}

// 清除草稿
function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
}

// 检查草稿
function checkDraft() {
    const draftStr = localStorage.getItem(DRAFT_KEY)
    if (draftStr) {
        ElMessageBox.confirm(
            '检测到您有未完成的发布内容，是否恢复？',
            '恢复草稿',
            {
                confirmButtonText: '恢复',
                cancelButtonText: '取消',
                type: 'info',
            }
        ).then(() => {
            restoreDraft()
        }).catch(() => {
            clearDraft()
        })
    }
}

// 图片上传组件引用
const imageUploaderRef = ref<InstanceType<typeof ImageUploader>>()

// 表单验证规则
const rules: FormRules = {
    brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
    seriesId: [{ required: true, message: '请选择车系', trigger: 'change' }],
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { min: 5, max: 50, message: '标题长度在 5-50 个字符', trigger: 'blur' },
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        {
            validator: (_rule, value, callback) => {
                const result = validatePrice(value)
                result.valid ? callback() : callback(new Error(result.message))
            },
            trigger: 'blur',
        },
    ],
    firstRegDate: [{ required: true, message: '请选择上牌时间', trigger: 'change' }],
    mileage: [
        { required: true, message: '请输入里程数', trigger: 'blur' },
        {
            validator: (_rule, value, callback) => {
                const result = validateMileage(value)
                result.valid ? callback() : callback(new Error(result.message))
            },
            trigger: 'blur',
        },
    ],
    gearbox: [{ required: true, message: '请选择变速箱类型', trigger: 'change' }],
    vin: [
        {
            validator: (_rule, value, callback) => {
                if (!value) {
                    callback()
                    return
                }
                const result = validateVin(value)
                result.valid ? callback() : callback(new Error(result.message))
            },
            trigger: 'blur',
        },
    ],
    location: [{ required: true, message: '请选择车辆所在地', trigger: 'change' }],
    images: [
        { required: true, message: '请上传车辆图片', trigger: 'change' },
        {
            validator: (_rule, value: ImageItem[], callback) => {
                if (!value || value.length === 0) {
                    callback(new Error('请至少上传一张图片'))
                    return
                }
                // 检查是否有有效图片（排除已删除和失败的）
                const validImages = value.filter(img => img.status === 'done' || img.status === 'existing')
                if (validImages.length === 0) {
                    callback(new Error('请至少上传一张图片'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
}

// 步骤配置
const steps = computed(() => [
    { title: t('publish.stepBasic'), icon: 'Document' },
    { title: t('publish.stepCondition'), icon: 'Setting' },
    { title: t('publish.stepImages'), icon: 'Picture' },
    { title: t('publish.stepConfirm'), icon: 'Check' },
])

// 变速箱选项
const gearboxOptions = computed(() => [
    { label: t('car.gearboxType.manual'), value: 'manual' },
    { label: t('car.gearboxType.auto'), value: 'auto' },
    { label: t('car.gearboxType.cvt'), value: 'cvt' },
    { label: 'DCT', value: 'dct' },
])

// 燃料类型选项
const fuelTypeOptions = computed(() => [
  { label: t('car.fuel.gasoline'), value: 'gasoline' },
  { label: t('car.fuel.diesel'), value: 'diesel' },
  { label: t('car.fuel.electric'), value: 'electric' },
  { label: t('car.fuel.hybrid'), value: 'hybrid' },
  { label: t('car.fuel.phev'), value: 'phev' },
])

// 排放标准选项
const emissionOptions = EMISSION_STANDARD_OPTIONS

// 使用性质选项
const useTypeOptions = USE_TYPE_OPTIONS

// 车辆配置选项
const configOptions = CAR_CONFIG_OPTIONS

// 品牌变化时清空车系
function handleBrandChange() {
    formData.seriesId = null
    if (formData.brandId) {
        carStore.fetchSeries(formData.brandId)
    }
}

// 下一步
async function nextStep() {
    if (!formRef.value) return

    // 验证当前步骤的字段
    const fieldsToValidate = getStepFields(currentStep.value)
    try {
        await formRef.value.validateField(fieldsToValidate)
        currentStep.value++
    } catch {
        // 验证失败
    }
}

// 上一步
function prevStep() {
    currentStep.value--
}

// 获取步骤对应的字段
function getStepFields(step: number): string[] {
    switch (step) {
        case 0:
            return ['brandId', 'seriesId', 'title', 'price']
        case 1:
            return ['firstRegDate', 'mileage', 'gearbox', 'vin', 'location']
        case 2:
            return ['images']
        default:
            return []
    }
}

// 提交发布
async function handleSubmit() {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
    } catch {
        ElMessage.error('请检查表单填写是否完整')
        return
    }

  submitting.value = true
  try {
    // 从图片管理器获取图片 URL
    const imageUrls = imageUploaderRef.value?.getSubmitData?.()?.all || 
      formData.images.filter(img => img.status === 'done' || img.status === 'existing').map(img => img.url)
    
    const submitData = {
      brandId: formData.brandId,
      seriesId: formData.seriesId,
      title: formData.title,
      price: formData.price,
      originalPrice: formData.originalPrice || undefined,
      firstRegDate: formData.firstRegDate,
      mileage: formData.mileage,
      gearbox: formData.gearbox,
      fuelType: formData.fuelType || undefined,
      displacement: formData.displacement || undefined,
      color: formData.color || undefined,
      vin: formData.vin || undefined,
      plateNumber: formData.plateNumber || undefined,
      emissionStandard: formData.emissionStandard || undefined,
      useType: formData.useType || undefined,
      transferCount: formData.transferCount || 0,
      configs: formData.configs.length > 0 ? formData.configs : undefined,
      provinceCode: formData.location[0] || undefined,
      cityCode: formData.location[1] || undefined,
      districtCode: formData.location[2] || undefined,
      address: formData.address || undefined,
      images: imageUrls,
      coverImage: imageUrls[0],
      video: formData.video || undefined,
      videoThumbnail: formData.videoThumbnail || undefined,
      description: formData.description || undefined,
      contactPhone: formData.usePlatformPhone ? undefined : formData.contactPhone,
      usePlatformPhone: formData.usePlatformPhone,
    }

    await carStore.createCar(submitData)
    clearDraft() // 提交成功后清除草稿
    ElMessage.success(t('publish.success'))
    router.push('/my-cars')
  } catch (error: any) {
    ElMessage.error(error.message || t('message.operationFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
    carStore.fetchBrands()
    checkDraft()
})
</script>

<template>
    <div class="publish-page">
        <div class="page-container">
            <div class="publish-card card">
                <h1 class="page-title">{{ t('publish.title') }}</h1>

                <!-- 步骤条 -->
                <el-steps :active="currentStep" finish-status="success" class="publish-steps">
                    <el-step v-for="step in steps" :key="step.title" :title="step.title" />
                </el-steps>

                <!-- 表单 -->
                <el-form
                    ref="formRef"
                    :model="formData"
                    :rules="rules"
                    label-width="100px"
                    class="publish-form"
                >
                    <!-- 步骤1：基本信息 -->
                    <div v-show="currentStep === 0" class="step-content">
                        <el-form-item label="品牌" prop="brandId">
                            <el-select
                                v-model="formData.brandId"
                                placeholder="请选择品牌"
                                filterable
                                style="width: 100%"
                                @change="handleBrandChange"
                            >
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
                                v-model="formData.seriesId"
                                placeholder="请选择车系"
                                filterable
                                :disabled="!formData.brandId"
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
                        <el-form-item label="标题" prop="title">
                            <el-input
                                v-model="formData.title"
                                placeholder="请输入车辆标题，如：2020款 宝马3系 325Li"
                                maxlength="50"
                                show-word-limit
                            />
                        </el-form-item>
                        <el-form-item label="售价" prop="price">
                            <el-input-number
                                v-model="formData.price"
                                :min="0"
                                :max="99999999"
                                :precision="0"
                                placeholder="请输入售价"
                                style="width: 200px"
                            />
                            <span class="form-unit">元</span>
                        </el-form-item>
                        <el-form-item label="新车指导价">
                            <el-input-number
                                v-model="formData.originalPrice"
                                :min="0"
                                :max="99999999"
                                :precision="0"
                                placeholder="选填"
                                style="width: 200px"
                            />
                            <span class="form-unit">元</span>
                        </el-form-item>
                    </div>

                    <!-- 步骤2：车况信息 -->
                    <div v-show="currentStep === 1" class="step-content">
                        <el-form-item label="上牌时间" prop="firstRegDate">
                            <el-date-picker
                                v-model="formData.firstRegDate"
                                type="month"
                                placeholder="请选择上牌时间"
                                format="YYYY年MM月"
                                value-format="YYYY-MM"
                                style="width: 200px"
                            />
                        </el-form-item>
                        <el-form-item label="表显里程" prop="mileage">
                            <el-input-number
                                v-model="formData.mileage"
                                :min="0"
                                :max="9999999"
                                :precision="0"
                                placeholder="请输入里程数"
                                style="width: 200px"
                            />
                            <span class="form-unit">公里</span>
                        </el-form-item>
                        <el-form-item label="变速箱" prop="gearbox">
                            <el-radio-group v-model="formData.gearbox">
                                <el-radio
                                    v-for="opt in gearboxOptions"
                                    :key="opt.value"
                                    :value="opt.value"
                                >
                                    {{ opt.label }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="燃料类型">
                            <el-radio-group v-model="formData.fuelType">
                                <el-radio
                                    v-for="opt in fuelTypeOptions"
                                    :key="opt.value"
                                    :value="opt.value"
                                >
                                    {{ opt.label }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="排量">
                            <el-input-number
                                v-model="formData.displacement"
                                :min="0"
                                :max="20"
                                :precision="1"
                                :step="0.1"
                                placeholder="请输入排量"
                                style="width: 200px"
                            />
                            <span class="form-unit">L</span>
                        </el-form-item>
                        <el-form-item label="车身颜色">
                            <el-input
                                v-model="formData.color"
                                placeholder="如：白色、黑色"
                                style="width: 200px"
                            />
                        </el-form-item>
                        <el-form-item label="VIN码" prop="vin">
                            <el-input
                                v-model="formData.vin"
                                placeholder="17位车架号（选填）"
                                maxlength="17"
                                style="width: 300px"
                            />
                        </el-form-item>
                        <el-form-item label="车牌号">
                            <el-input
                                v-model="formData.plateNumber"
                                placeholder="如：京A12345（选填）"
                                style="width: 200px"
                            />
                        </el-form-item>
                        <el-form-item label="排放标准">
                            <el-select v-model="formData.emissionStandard" placeholder="请选择" style="width: 200px">
                                <el-option
                                    v-for="opt in emissionOptions"
                                    :key="opt.value"
                                    :label="opt.label"
                                    :value="opt.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="使用性质">
                            <el-select v-model="formData.useType" placeholder="请选择" style="width: 200px">
                                <el-option
                                    v-for="opt in useTypeOptions"
                                    :key="opt.value"
                                    :label="opt.label"
                                    :value="opt.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="过户次数">
                            <el-input-number
                                v-model="formData.transferCount"
                                :min="0"
                                :max="99"
                                :precision="0"
                                style="width: 120px"
                            />
                            <span class="form-unit">次</span>
                        </el-form-item>
                        <el-form-item label="车辆配置">
                            <el-checkbox-group v-model="formData.configs">
                                <el-checkbox
                                    v-for="opt in configOptions"
                                    :key="opt.value"
                                    :value="opt.value"
                                >
                                    {{ opt.label }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                        <el-form-item label="车辆所在地" prop="location">
                            <LocationSelector v-model="formData.location" />
                        </el-form-item>
                        <el-form-item label="详细地址">
                            <AddressInput v-model="formData.address" placeholder="请输入详细地址（选填）" style="width: 400px" />
                        </el-form-item>
                    </div>

                    <!-- 步骤3：图片视频 -->
                    <div v-show="currentStep === 2" class="step-content">
                        <el-form-item label="车辆图片" prop="images">
                            <ImageUploader ref="imageUploaderRef" v-model="formData.images" :limit="9" />
                        </el-form-item>
                        <el-form-item label="车辆视频">
                            <VideoUploader
                                v-model="formData.video"
                                :thumbnail="formData.videoThumbnail"
                                @update:thumbnail="formData.videoThumbnail = $event"
                            />
                            <div class="form-tip">上传车辆介绍视频，让买家更直观了解车况（选填）</div>
                        </el-form-item>
                        <el-form-item label="车辆描述">
                            <el-input
                                v-model="formData.description"
                                type="textarea"
                                :rows="4"
                                placeholder="请输入车辆描述信息（选填）"
                                maxlength="500"
                                show-word-limit
                            />
                        </el-form-item>
                        <el-divider>联系方式</el-divider>
                        <el-form-item label="联系方式">
                            <el-checkbox v-model="formData.usePlatformPhone">
                                使用平台销售电话（保护个人隐私）
                            </el-checkbox>
                        </el-form-item>
                        <el-form-item v-if="!formData.usePlatformPhone" label="联系电话">
                            <el-input
                                v-model="formData.contactPhone"
                                placeholder="请输入联系电话"
                                maxlength="11"
                                style="width: 200px"
                            />
                        </el-form-item>
                        <el-alert
                            v-if="formData.usePlatformPhone"
                            title="选择此选项后，买家将通过平台客服联系您，保护您的个人隐私"
                            type="info"
                            :closable="false"
                            show-icon
                        />
                    </div>

                    <!-- 步骤4：确认发布 -->
                    <div v-show="currentStep === 3" class="step-content">
                        <div class="preview-section">
                            <h3>请确认以下信息</h3>
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="标题">{{ formData.title }}</el-descriptions-item>
                                <el-descriptions-item label="售价">{{ formData.price }} 元</el-descriptions-item>
                                <el-descriptions-item label="上牌时间">{{ formData.firstRegDate }}</el-descriptions-item>
                                <el-descriptions-item label="里程">{{ formData.mileage }} 公里</el-descriptions-item>
                                <el-descriptions-item :label="t('car.gearbox')">
                                    {{ gearboxOptions.find((o: { value: string }) => o.value === formData.gearbox)?.label || '-' }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="t('car.fuelType')">
                                    {{ fuelTypeOptions.find((o: { value: string }) => o.value === formData.fuelType)?.label || '-' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="图片数量">{{ formData.images.length }} 张</el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </div>
                </el-form>

                <!-- 操作按钮 -->
                <div class="form-actions">
                    <el-button v-if="currentStep > 0" @click="prevStep">{{ t('common.prev') }}</el-button>
                    <el-button v-if="currentStep < 3" type="primary" @click="nextStep">{{ t('common.next') }}</el-button>
                    <el-button
                        v-if="currentStep === 3"
                        type="primary"
                        :loading="submitting"
                        @click="handleSubmit"
                    >
                        {{ t('publish.publishBtn') }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* 页面容器 */
.publish-page {
    background: linear-gradient(180deg, #f0f5ff 0%, #f5f7fa 100%);
    min-height: calc(100vh - $header-height - 100px);
    padding: 24px 16px;
}

/* 内容容器 */
.page-container {
    max-width: 900px;
    margin: 0 auto;
}

/* 发布卡片 - 居中布局 */
.publish-card {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 48px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* 页面标题 */
.page-title {
    font-size: 26px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 36px;
    color: #303133;
}

/* 步骤条样式优化 */
.publish-steps {
    margin-bottom: 40px;
    padding: 0 20px;
    
    :deep(.el-step__title) {
        font-size: 14px;
        font-weight: 500;
    }
    
    :deep(.el-step__head.is-finish) {
        color: #409eff;
        border-color: #409eff;
    }
    
    :deep(.el-step__title.is-finish) {
        color: #409eff;
    }
}

/* 表单样式 */
.publish-form {
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }
    
    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
    }
    
    :deep(.el-input),
    :deep(.el-select) {
        width: 100%;
        max-width: 400px;
    }
}

/* 步骤内容区域 */
.step-content {
    min-height: 320px;
    padding: 8px 0;
}

/* 单位文本 */
.form-unit {
  margin-left: 12px;
  color: $text-secondary;
  font-size: 14px;
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 预览区域 */
.preview-section {
    h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #303133;
    }
    
    :deep(.el-descriptions) {
        margin-top: 16px;
    }
    
    :deep(.el-descriptions__label) {
        font-weight: 500;
        background: #fafafa;
    }
}

/* 操作按钮区域 */
.form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid #ebeef5;
    
    .el-button {
        min-width: 140px;
        height: 44px;
        font-size: 15px;
        border-radius: 8px;
    }
}

/* 响应式适配 */
@media (max-width: 768px) {
    .publish-page {
        padding: 16px 12px;
    }
    
    .publish-card {
        padding: 24px 20px;
        border-radius: 12px;
    }
    
    .page-title {
        font-size: 22px;
        margin-bottom: 24px;
    }
    
    .publish-steps {
        padding: 0;
        margin-bottom: 28px;
        
        :deep(.el-step__title) {
            font-size: 12px;
        }
    }
    
    .publish-form {
        :deep(.el-form-item__label) {
            width: 80px !important;
        }
        
        :deep(.el-input),
        :deep(.el-select),
        :deep(.el-input-number) {
            width: 100% !important;
            max-width: none;
        }
    }
    
    .form-actions {
        flex-direction: column;
        gap: 12px;
        
        .el-button {
            width: 100%;
        }
    }
}
</style>
