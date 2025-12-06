<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import LocationSelector from '@/components/LocationSelector.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { validateVin, validatePrice, validateMileage } from '@/utils'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const router = useRouter()
const carStore = useCarStore()

const formRef = ref<FormInstance>()
const currentStep = ref(0)
const submitting = ref(false)

// 表单数据
const formData = reactive({
    // 基本信息
    brandId: null as number | null,
    seriesId: null as number | null,
    title: '',
    price: null as number | null,
    // 车况信息
    firstRegDate: '',
    mileage: null as number | null,
    gearbox: '',
    fuelType: '',
    displacement: null as number | null,
    color: '',
    vin: '',
    // 地理位置
    location: [] as string[],
    // 图片
    images: [] as string[],
    // 描述
    description: '',
})

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
            validator: (_rule, value, callback) => {
                if (!value || value.length === 0) {
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
        const submitData = {
            brandId: formData.brandId,
            seriesId: formData.seriesId,
            title: formData.title,
            price: formData.price,
            firstRegDate: formData.firstRegDate,
            mileage: formData.mileage,
            gearbox: formData.gearbox,
            fuelType: formData.fuelType || undefined,
            displacement: formData.displacement || undefined,
            color: formData.color || undefined,
            vin: formData.vin || undefined,
            provinceCode: formData.location[0] || undefined,
            cityCode: formData.location[1] || undefined,
            districtCode: formData.location[2] || undefined,
            images: formData.images,
            coverImage: formData.images[0],
            description: formData.description || undefined,
        }

        await carStore.createCar(submitData)
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
                        <el-form-item label="车辆所在地" prop="location">
                            <LocationSelector v-model="formData.location" />
                        </el-form-item>
                    </div>

                    <!-- 步骤3：图片上传 -->
                    <div v-show="currentStep === 2" class="step-content">
                        <el-form-item label="车辆图片" prop="images">
                            <ImageUploader v-model="formData.images" :limit="9" />
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
.publish-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.publish-card {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 32px;
}

.publish-steps {
    margin-bottom: 32px;
}

.step-content {
    min-height: 300px;
}

.form-unit {
    margin-left: 8px;
    color: $text-secondary;
}

.preview-section {
    h3 {
        font-size: 16px;
        margin-bottom: 16px;
    }
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid $border-color-lighter;
}
</style>
