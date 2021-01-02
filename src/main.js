import 'core-js/stable'
import axios from 'axios'
import CoreuiVue from '@coreui/vue'
import Buefy from 'buefy'
import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

import { utils } from './utils/common'
import { dateUtils } from './utils/date'
import { iconsSet as icons } from './assets/icons/icons.js'

// Vue config
Vue.prototype.$utils = utils
Vue.prototype.$dateUtils = dateUtils
Vue.http = Vue.prototype.$http = axios
Vue.config.performance = true

Vue.use(CoreuiVue)
Vue.use(Buefy)

new Vue({
  render: h => h(App),
  router,
  store,
  icons
}).$mount('#app')
