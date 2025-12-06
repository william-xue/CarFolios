<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import LocationSelector from '@/components/LocationSelector.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { validateVin, validatePrice, validateMileage } from '@/utils'

const route = useRoute()
const router = useRouter()
const carStore = useCarStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const carId = Number(route.params.id)

// 表单数据
const formData = reactive({
    brandId: null as number | null,
    seriesId: null as number | null,
    title: '',
    price: null as number | null,
    firstRegDate: '',
    mileage: null as number | null,
    gearbox: '',
    fuelType: '',
    displacement: null as number | null,
    color: '',
    vin: '',
    location: [] as string[],
    images: [] as string[],
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

// 变速箱选项
const gearboxOptions = [
    { label: '手动', value: 'manual' },
    { label: '自动', value: 'auto' },
    { label: 'CVT无级变速', value: 'cvt' },
    { label: '双离合', value: 'dct' },
]

// 燃料类型选项
const fuelTypeOptions = [
    { label: '汽油', value: 'gasoline' },
    { label: '柴油', value: 'diesel' },
    { label: '纯电动', value: 'electric' },
    { label: '油电混合', value: 'hybrid' },
    { label: '插电混动', value: 'phev' },
]

// 加载车辆详情
async function loadCarDetail() {
    loading.value = true
    try {
        const car = await carStore.fetchCarDetail(carId)
        
        // 填充表单数据
        formData.brandId = car.brandId
        formData.seriesId = car.seriesId
        formData.title = car.title
        formData.price = car.price
        formData.firstRegDate = car.firstRegDate || ''
        formData.mileage = car.mileage
        formData.gearbox = car.gearbox || ''
        formData.fuelType = car.fuelType || ''
        formData.displacement = car.displacement || null
        formData.color = car.color || ''
        formData.vin = car.vin || ''
        formData.description = car.description || ''
        formData.images = car.images || (car.coverImage ? [car.coverImage] : [])
        
        // 设置地理位置
        const locationCodes: string[] = []
        if (car.provinceCode) locationCodes.push(car.provinceCode)
        if (car.cityCode) locationCodes.push(car.cityCode)
        if (car.districtCode) locationCodes.push(car.districtCode)
        formData.location = locationCodes

        // 加载车系
        if (car.brandId) {
            await carStore.fetchSeries(car.brandId)
        }
    } catch (error) {
        ElMessage.error('加载车辆信息失败')
        router.push('/my-cars')
    } finally {
        loading.value = false
    }
}

// 品牌变化时清空车系
function handleBrandChange() {
    formData.seriesId = null
    if (formData.brandId) {
        carStore.fetchSeries(formData.brandId)
    }
}

// 提交更新
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

        await carStore.updateCar(carId, submitData)
        ElMessage.success('更新成功')
        router.push('/my-cars')
    } catch (error: any) {
        ElMessage.error(error.message || '更新失败')
    } finally {
        submitting.value = false
    }
}

// 取消编辑
function handleCancel() {
    router.back()
}

onMounted(async () => {
    await carStore.fetchBrands()
    await loadCarDetail()
})
</script>

<template>
    <div class="edit-page">
        <div class="page-container">
            <div v-loading="loading" class="edit-card card">
                <h1 class="page-title">编辑车源</h1>

                <el-form
                    ref="formRef"
                    :model="formData"
                    :rules="rules"
                    label-width="100px"
                    class="edit-form"
                >
                    <!-- 基本信息 -->
                    <div class="form-section">
                        <h3 class="section-title">基本信息</h3>
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
                                placeholder="请输入车辆标题"
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

                    <!-- 车况信息 -->
                    <div class="form-section">
                        <h3 class="section-title">车况信息</h3>
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

                    <!-- 图片和描述 -->
                    <div class="form-section">
                        <h3 class="section-title">图片和描述</h3>
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
                </el-form>

                <!-- 操作按钮 -->
                <div class="form-actions">
                    <el-button @click="handleCancel">取消</el-button>
                    <el-button type="primary" :loading="submitting" @click="handleSubmit">
                        保存修改
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.edit-card {
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

.form-section {
    margin-bottom: 32px;
}

.section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid $border-color-lighter;
}

.form-unit {
    margin-left: 8px;
    color: $text-secondary;
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
