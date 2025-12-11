import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'
import './styles/global.scss'

import App from './App.vue'
import router from './router'
import i18n from './locales'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(i18n)
// 配置 Element Plus 中文语言包
app.use(ElementPlus, { size: 'default', zIndex: 3000, locale: zhCn })

app.mount('#app')
