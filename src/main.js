import 'core-js/stable'
import axios from 'axios'
import CoreuiVue from '@coreui/vue'
import Vue from 'vue'

import { Select, Table, Sidebar, Menu } from 'buefy'
import { Notification, Dialog, Modal } from 'buefy'
import { Field, Input, Radio } from 'buefy'

import App from './App.vue'
import router from './router'
import store from './store'
import { utils } from './utils'
import { iconsSet as icons } from './assets/icons/icons.js'

// Buefy config
Vue.use(Select)
Vue.use(Table)
Vue.use(Sidebar)
Vue.use(Menu)
Vue.use(Notification)
Vue.use(Dialog)
Vue.use(Modal)
Vue.use(Field)
Vue.use(Input)
Vue.use(Radio)

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
