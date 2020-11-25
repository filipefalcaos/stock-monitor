import 'core-js/stable'
import axios from 'axios'
import CoreuiVue from '@coreui/vue'
import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import { utils } from './utils'
import { iconsSet as icons } from './assets/icons/icons.js'

import {
  Dialog,
  Field,
  Input,
  Loading,
  Menu,
  Modal,
  Notification,
  Radio,
  Select,
  Sidebar,
  Table
} from 'buefy'

// Buefy config
Vue.use(Dialog)
Vue.use(Field)
Vue.use(Input)
Vue.use(Loading)
Vue.use(Menu)
Vue.use(Modal)
Vue.use(Notification)
Vue.use(Radio)
Vue.use(Select)
Vue.use(Sidebar)
Vue.use(Table)

// Vue config
Vue.prototype.$utils = utils
Vue.http = Vue.prototype.$http = axios
Vue.config.performance = true
Vue.use(CoreuiVue)

new Vue({
  render: h => h(App),
  router,
  store,
  icons
}).$mount('#app')
