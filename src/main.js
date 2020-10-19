import 'core-js/stable'
import Vue from 'vue'
import CoreuiVue from '@coreui/vue'

import App from './App.vue'
import router from './router'
import store from './store'
import { iconsSet as icons } from './assets/icons/icons.js'

Vue.config.performance = true
Vue.use(CoreuiVue)

new Vue({
  render: h => h(App),
  router,
  store,
  icons
}).$mount('#app')
