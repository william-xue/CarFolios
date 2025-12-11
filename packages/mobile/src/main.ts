import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import router from './router'
import App from './App.vue'
import 'vant/lib/index.css'
import './style.css'

// 配置 Vant 中文语言包
Locale.use('zh-CN', zhCN)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
