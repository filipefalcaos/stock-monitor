import Vue from 'vue'
import axios from 'axios'
import { Table, Button } from 'buefy'
import 'buefy/dist/buefy.css'

import App from './App'
import router from './router'

Vue.use(Table);
Vue.use(Button);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// New Vue instance
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app');
