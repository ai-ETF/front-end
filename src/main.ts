import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 按需引入 Ant Design Vue 组件
import { Layout, Menu, Button } from 'ant-design-vue'

import App from './App.vue'
import router from './router'

// 引入 Ant Design Vue 样式
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 按需注册 Ant Design Vue 组件
app.use(Layout)
app.use(Menu)
app.use(Button)

app.mount('#app')
