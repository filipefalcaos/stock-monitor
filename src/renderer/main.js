import Vue from 'vue'
import axios from 'axios'
import { Button, Notification, Select, Table } from 'buefy'
import 'buefy/dist/buefy.css'

import App from './App'
import router from './router'

// Vue config
Vue.use(Button);
Vue.use(Notification);
Vue.use(Select);
Vue.use(Table);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// New Vue instance
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app');
