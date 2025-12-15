import store from './store/index.js'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import './plugins/element.js'
import './assets/css/icon.css'
import 'element-plus/dist/index.css'
import preventReClick from './utils/preventReClick.js'

import router from './router'


// import SvgIcon from '@/components/SvgIcon.vue'
// import importAllSvgIcons from './components/SvgIcon'

// 引入
const app = createApp(App)
app.use(preventReClick)
app.use(store)
app.config.devtools = true
app.use(ElementPlus)
app.use(router).mount('#app')